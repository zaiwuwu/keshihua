/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1464122942")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX idx_quotations_docId ON quotations (docId)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1464122942")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
