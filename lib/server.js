const { makeExecutableSchema } = require("graphql-tools")
const MeshbluHttp = require("meshblu-http")
const { promisify } = require("util")

module.exports = function({ port, meshbluConfig }, callback) {
  const fastify = require("fastify")()
  const meshbluHttp = new MeshbluHttp(meshbluConfig)
  const typeDefs = `
  type MeshbluProps {
    version: String
  }
  type Device {
    uuid: String!
    type: String
    owner: String
    meshblu: MeshbluProps
  }
  type Query {
    whoami: Device
    device(uuid: String!): Device
    devices(type: String!): [Device]
    registerDevice(type: String!): Device
  }
  `

  const resolvers = {
    Query: {
      whoami() {
        return promisify(meshbluHttp.whoami)()
      },
      registerDevice(_, { type }) {
        const owner = meshbluHttp.uuid
        return promisify(meshbluHttp.register)({ type, owner })
      },
      device(_, { uuid }) {
        return promisify(meshbluHttp.device)(uuid)
      },
      devices(_, { type }) {
        const projection = { uuid: true, type: true }
        return promisify(meshbluHttp.search)({ type }, { projection })
      },
    },
  }

  const schema = makeExecutableSchema({ typeDefs, resolvers })

  fastify.register(require("fastify-apollo"), {
    prefix: "/api",
    graphql: { schema },
    graphiql: true,
    printSchema: true,
  })

  fastify.listen(port, err => {
    callback(err, fastify)
  })
}
