// import { Server } from "socket.io"

// let connections = {}
// let messages = {}
// let timeOnLine = {}

// export const connectToSocket = (server)=>{
//     const io = new Server(server, {
//         cors : {
//             origin: [
//                 'https://rootcall-frontend.onrender.com',
//                 'http://localhost:3000'
//             ],
//             methods: ["GET", "POST"],
//             credentials: true
//         }
//     });

//     io.on("connection", (socket)=>{ //! This is like an event listener like document.addEventListener, it listens for any connection request

//         console.log("SOMETHING CONNECTED")

//         //! This accepts the emit message from the client side, moreover the "join-call" is just a name, can write any name but it would same at clinet socket.on and server socket.on
//         socket.on("join-call", (path)=>{
//             if(connections[path] == undefined){
//                 connections[path] = []
//             }
//             connections[path].push(socket.id)
//             timeOnLine[socket.id] = new Date();

//             // FIX 1: Send all clients in the room to every user
//             // WHAT: Changed to emit both socket.id AND connections[path] array
//             // WHY: Frontend needs the full list of clients to establish RTCPeerConnection with each one
//             for(let a=0; a<connections[path].length; a++){
//                 io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
//             }

//             if(messages[path] !== undefined){
//                 // send stored chat history to the newly joined socket
//                 for(let a = 0; a < messages[path].length; ++a){
//                     const msg = messages[path][a];
//                     socket.emit("chat-message", msg.data, msg.sender, msg['socket-id-sender']);
//                 }
//             }
//         })

//         socket.on("signal", (toId, message)=>{
//             io.to(toId).emit("signal", socket.id, message)
//         })

//         socket.on("chat-message", (data, sender)=>{

//             const[matchingRoom, found] = Object.entries(connections)
//             .reduce(([room, isFound], [roomKey, roomValue])=>{

//                 if(!isFound && roomValue.includes(socket.id)){
//                     return [roomKey, true];
//                 }
//                 return [room, isFound];
//             } , ['', false]);
                
//             if(found==true){
//                 if(messages[matchingRoom] == undefined){
//                     messages[matchingRoom] = []
//                 }

//                 messages[matchingRoom].push({'sender' : sender, 'data' : data, "socket-id-sender" : socket.id})
//                 console.log("message", matchingRoom, ":", sender, data)

//                 connections[matchingRoom].forEach((elem)=>{
//                     io.to(elem).emit("chat-message", data, sender, socket.id)
//                 })
//             }
//         })

//         socket.on("disconnect", ()=>{

//             var diffTime = Math.abs(timeOnLine[socket.id] - new Date())

//             var key

//             for(const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))){

//                 for(let a = 0 ; a < v.length ; ++a){
//                     if(v[a] == socket.id){
//                         key = k;

//                         for(let a =0; a< connections[key].length; ++a){
//                             io.to(connections[key][a]).emit('user-left', socket.id)
//                         }

//                             var index = connections[key].indexOf(socket.id)
//                             if(index > -1){
//                                 connections[key].splice(index, 1)
//                             }

//                         if( connections[key].length == 0){
//                             delete connections[key]
//                         }
//                     }
//                 }

//             }
//         })
//     })

//     return io;
// }



import { Server } from "socket.io"

let connections = {}
let messages = {}
let timeOnLine = {}
let usernames = {} // Store usernames for each socket

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: [
                'https://rootcall-frontend.onrender.com',
                'http://localhost:3000'
            ],
            methods: ["GET", "POST"],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    io.on("connection", (socket) => {
        console.log("✅ SOMETHING CONNECTED:", socket.id)

        socket.on("join-call", (path, username) => {
            console.log(`👤 User ${username} (${socket.id}) joining ${path}`)
            
            if (connections[path] == undefined) {
                connections[path] = []
            }
            
            connections[path].push(socket.id)
            timeOnLine[socket.id] = new Date()
            usernames[socket.id] = username || 'Anonymous'

            // Send the full client list to all users in the room, including the joiner's username
            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit(
                    "user-joined", 
                    socket.id, 
                    connections[path],
                    username
                )
            }

            // Send chat history to newly joined user
            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    const msg = messages[path][a]
                    socket.emit("chat-message", msg.data, msg.sender, msg['socket-id-sender'])
                }
            }

            console.log(`📊 Room ${path} now has ${connections[path].length} users`)
        })

        socket.on("signal", (toId, message) => {
            console.log(`📡 Signal from ${socket.id} to ${toId}`)
            io.to(toId).emit("signal", socket.id, message)
        })

        socket.on("chat-message", (data, sender) => {
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true]
                    }
                    return [room, isFound]
                }, ['', false])
                
            if (found == true) {
                if (messages[matchingRoom] == undefined) {
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({
                    'sender': sender, 
                    'data': data, 
                    "socket-id-sender": socket.id
                })
                
                console.log("💬 Message in", matchingRoom, ":", sender, data)

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }
        })

        socket.on("disconnect", () => {
            console.log("🔌 User disconnected:", socket.id)
            
            var diffTime = Math.abs(timeOnLine[socket.id] - new Date())
            var key

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
                for (let a = 0; a < v.length; ++a) {
                    if (v[a] == socket.id) {
                        key = k

                        // Notify all other users in the room
                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                        // Remove the disconnected user
                        var index = connections[key].indexOf(socket.id)
                        if (index > -1) {
                            connections[key].splice(index, 1)
                        }

                        // Clean up the room if empty
                        if (connections[key].length == 0) {
                            delete connections[key]
                            delete messages[key]
                        }
                        
                        console.log(`📊 Room ${key} now has ${connections[key]?.length || 0} users`)
                    }
                }
            }

            // Clean up user data
            delete usernames[socket.id]
            delete timeOnLine[socket.id]
        })
    })

    return io
}