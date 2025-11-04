import { Server } from "socket.io"

let connections = {}
let messages = {}
let timeOnLine = {}

export const connectToSocket = (server)=>{
    const io = new Server(server, {
        cors : { //! Don't do this in production level, allowing request from everywhere
            origin : "*",
            methods : ["GET", "POST"],
            allowedHeaders : ['*'],
            credentials : true
        }
    });

    io.on("connection", (socket)=>{ //! This is like an event listener like document.addEventListener, it listens for any connection request

        console.log("SOMETHING CONNECTED")

        //! This accepts the emit message from the client side, moreover the "join-call" is just a name, can write any name but it would same at clinet socket.on and server socket.on
        socket.on("join-call", (path)=>{
            if(connections[path] == undefined){
                connections[path] = []
            }
            connections[path].push(socket.id)
            timeOnLine[socket.id] = new Date();

            // FIX 1: Send all clients in the room to every user
            // WHAT: Changed to emit both socket.id AND connections[path] array
            // WHY: Frontend needs the full list of clients to establish RTCPeerConnection with each one
            for(let a=0; a<connections[path].length; a++){
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
            }

            if(messages[path] !== undefined){
                // send stored chat history to the newly joined socket
                for(let a = 0; a < messages[path].length; ++a){
                    const msg = messages[path][a];
                    socket.emit("chat-message", msg.data, msg.sender, msg['socket-id-sender']);
                }
            }
        })

        socket.on("signal", (toId, message)=>{
            io.to(toId).emit("signal", socket.id, message)
        })

        socket.on("chat-message", (data, sender)=>{

            const[matchingRoom, found] = Object.entries(connections)
            .reduce(([room, isFound], [roomKey, roomValue])=>{

                if(!isFound && roomValue.includes(socket.id)){
                    return [roomKey, true];
                }
                return [room, isFound];
            } , ['', false]);
                
            if(found==true){
                if(messages[matchingRoom] == undefined){
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({'sender' : sender, 'data' : data, "socket-id-sender" : socket.id})
                console.log("message", matchingRoom, ":", sender, data)

                connections[matchingRoom].forEach((elem)=>{
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }
        })

        socket.on("disconnect", ()=>{

            var diffTime = Math.abs(timeOnLine[socket.id] - new Date())

            var key

            for(const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))){

                for(let a = 0 ; a < v.length ; ++a){
                    if(v[a] == socket.id){
                        key = k;

                        for(let a =0; a< connections[key].length; ++a){
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                            var index = connections[key].indexOf(socket.id)
                            if(index > -1){
                                connections[key].splice(index, 1)
                            }

                        if( connections[key].length == 0){
                            delete connections[key]
                        }
                    }
                }

            }
        })
    })

    return io;
}