const io = require('socket.io')(5500, { cors: { origin: "*" } });
const NodeRSA = require('node-rsa');
const key = new NodeRSA({ b: 512 });


const users = {};
let onlineUsers = 0;

io.on('connection', socket => {
    onlineUsers = onlineUsers + 1;
    socket.emit('userIncrement', onlineUsers);

    socket.on('new-user-joined', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', { name: users[socket.id], onUsers: onlineUsers })
    })

    socket.on('send', data => {
        const encrypted = key.encrypt(data.message, 'base64');
        const decrypted = key.decrypt(encrypted, 'utf8');
        socket.broadcast.emit('receive', { message: decrypted, name: users[socket.id], id: data.id })
    })



    socket.on('disconnect', () => {
        onlineUsers = onlineUsers - 1;
        socket.broadcast.emit('disconnected', { name: users[socket.id], onUsers: onlineUsers })
        delete users[socket.id]
    })


})