const io = require('socket.io')(8000, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

io.on('connection', socket => {
  socket.on('get-document', docID => {
    const data = '';
    socket.join(docID);

    socket.emit('load-document', data);

    socket.on('send-changes', (delta) => {
      // means broadcast to all clients except the sender. `delta` are the changes!
      socket.broadcast.to(docID).emit('receive-changes', delta);
    });
  });

});