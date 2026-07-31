/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3949997442")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX idx_materialPrice_docId ON materialPrice (docId)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3949997442")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
