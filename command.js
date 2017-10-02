const startServer = require("./lib/server")
const MeshbluConfig = require("meshblu-config")

const port = process.env.PORT || 3000
const meshbluConfig = new MeshbluConfig().generate()

startServer({ port, meshbluConfig }, (err, fastify) => {
  if (err) throw err
  for (let route of fastify) {
    console.log("route", Object.keys(route))
  }
  console.log(`listening on ${fastify.server.address().port}`)
})
