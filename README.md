dbstream-memory
===============

A memory-based database API, compatible with the [dbstream](https://github.com/avinoamr/dbstream) API

### Usage

```javascript
var db = require("dbstream-memory");
var connection = db.connect();

// write or update
var cursor = new connection.Cursor()
cursor.write({ id: 1, name: "Hello" });
cursor.write({ id: 2, name: "World" });
cursor.on("finish", function() {
  console.log("Saved 2 objects");
});
cursor.end();

// read
new connection.Cursor()
  .find({ id: 2 })
  .limit( 1 )
  .on("data", function (obj) {
    console.log("Loaded", obj);
  });
```

### API

This module implements the [dbstream](https://github.com/avinoamr/dbstream) API. For the complete documention see: https://github.com/avinoamr/dbstream

###### connect( [object] )

* `object` a key-value map of existing objects
* Returns a dbstream [Cursor](https://github.com/avinoamr/dbstream#cursor) object


