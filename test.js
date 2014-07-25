var memory = require( "./memory" );
var stream = require( "stream" );
var assert = require( "assert" );
var util = require( "util" );

describe( "Memory", function () {

    it( "Insert", function ( done ) {
        var data = {};
        var connection = memory.connect( data );
        var cursor = new connection.Cursor();
        cursor.write({ name: "Hello" })
        cursor.write({ name: "World" })
        cursor.on( "finish", function() {
            var values = Object.keys( data ).map( function ( id ) {
                return data[ id ];
            });

            assert.equal( values.length, 2 );
            assert.equal( values[ 0 ].name, "Hello" );
            assert.equal( values[ 1 ].name, "World" );
            assert( values[ 0 ].id ); // id is generated
            assert( values[ 1 ].id );
            done();
        }).end();
    });

    it( "Upsert", function ( done ) {
        var data = { 1: { name: "Hello", id: 1 }, 2: { name: "World", id: 2 } };
        var connection = memory.connect( data );
        var cursor = new connection.Cursor();

        cursor.write({ id: 2, name: "Foo" });
        cursor.write({ id: 3, name: "Bar" });
        cursor.on( "finish", function() {
            assert.deepEqual( data, {
                1: { name: "Hello", id: 1 },
                2: { name: "Foo", id: 2 },
                3: { name: "Bar", id: 3 }
            })
            done();
        }).end();
    });

    it( "Remove", function ( done ) {
        var data = { 1: { name: "Hello", id: 1 }, 2: { name: "World", id: 2 } };
        var connection = memory.connect( data );
        var cursor = new connection.Cursor();

        cursor.remove({ id: 1 })
        cursor.on( "finish", function () {
            assert.deepEqual( data, {
                2: { name: "World", id: 2 }
            });
            done();
        }).end();
    });

    it( "Read", function ( done ) {
        var data = { 1: { name: "Hello", id: 1 }, 2: { name: "World", id: 2 } };
        var connection = memory.connect( data );
        var cursor = new connection.Cursor();

        var found = [];
        cursor.find({})
            .on( "data", function ( obj ) { found.push( obj ) } )
            .on( "end", function () {
                assert.deepEqual( found, [
                    { name: "Hello", id: 1 },
                    { name: "World", id: 2 }
                ])
                done();
            })
    });

    it( "Implements the Query API", function ( done ) {
        var connection = memory.connect();
        var cursor = new connection.Cursor();

        // insert the initial data
        [
            { name: "Hello", age: 5, id: 1 },
            { name: "World", age: 8, id: 2 },
            { name: "Foo", age: 10, id: 3 },
            { name: "Alice", age: 14 },
            { name: "Bob", age: 17 },
            { name: "Charlie", age: 21 }
        ].forEach( cursor.write, cursor );

        cursor.on( "finish", function () {
            var arr = [];

            new connection.Cursor()
                .find({ age: { $gt: 6, $lt: 20 } })
                .skip( 1 )
                .limit( 2 )
                .pipe(new Map(function ( obj ) {
                    obj.age *= 2;
                    return obj;
                }))
                .pipe( new connection.Cursor() )
                .on( "finish", function () {
                    var results = [];
                    this.find({ name: "Alice" })
                        .on( "data", function ( obj ) {
                            assert( obj.id )
                            assert.equal( obj.name, "Alice" )
                            assert.equal( obj.age, 28 );
                            done();
                        })
                })
        })
        .end();

        util.inherits( Map, stream.Transform );
        function Map ( fn ) {
            Map.super_.call( this, { objectMode: true } );
            this._fn = fn;
        }
        Map.prototype._transform = function ( obj, encoding, callback ) {
            this.push( this._fn( obj ) );
            callback();
        }
    });


});