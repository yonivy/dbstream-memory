var dbstream = require( "dbstream" );
var sift = require( "sift" );
var util = require( "util" );

util.inherits( Cursor, dbstream.Cursor );
function Cursor ( data ) {
    Cursor.super_.call( this );
    this._data = data;
}

Cursor.prototype._save = function ( obj, callback ) {
    if ( !obj.id ) {
        obj.id = Math.random().toString( 36 ).substr( 2 );
    }
    this._data[ obj.id ] = copy( obj );
    process.nextTick( callback );
}

Cursor.prototype._load = function ( size ) {
    if ( this._loading ) return;
    this._loading = true;
    var query = this._query,
        sort = this._sort || [],
        skip = this._skip || 0,
        limit = this._limit || Infinity;

    var data = [];
    var sifter = sift( query );
    for ( var id in this._data ) {
        if ( sifter.test( this._data[ id ] ) ) {
            data.push( this._data[ id ] );
        }
    }

    data.sort( function ( d1, d2 ) {
        for ( var s = 0 ; s < sort.length ; s += 1 ) {
            s = sort[ s ];
            if ( d1[ s.key ] == d2[ s.key ] ) continue;
            return d1[ s.key ] > d2[ s.key ] 
                ? s.direction : -s.direction;
        }
        return 0;
    })

    data.splice( 0, skip )
    data.splice( limit );
    data.push( null );
    data.map( copy ).forEach( this.push, this );
    this._loading = false;
}

Cursor.prototype._remove = function ( obj, callback ) {
    if ( obj.id && this._data[ obj.id ] ) {
        delete this._data[ obj.id ];
    }
    process.nextTick( callback );
}

module.exports.connect = function ( data ) {
    data || ( data = {} );
    var _Cursor = function() {
        _Cursor.super_.call( this, data );
    }
    util.inherits( _Cursor, Cursor );
    return { Cursor: _Cursor }
};

function copy ( obj ) {
    return JSON.parse( JSON.stringify( obj ) );
}