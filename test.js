var test = require( "dbstream/test" );
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

    it( "Implements the dbstream API", test( memory.connect() ) );


});