const express = require('express'); // import the Express framework for handling HTTP
const path = require('path');       // import Node's path module for building file paths safely
const http = require('http');
const { Server } = require('socket.io');

const app = express();              // create the Express application instance
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000; // use the environment's PORT if set, otherwise default to 3000

app.use(express.static(path.join(__dirname, '../public'))); // serve everything in the /public folder as static files
app.use(express.json({ limit: '12mb' }));

app.post('/api/recognize', async (req, res) => {
  const { image, target } = req.body;
  if (!image || !target) {
    return res.status(400).json({ error: 'image and target are required' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
  if (!OPENAI_API_KEY) {
    const localFallback = { match: false, text: 'NO_OPENAI_KEY: API not configured. Can only use local heuristic in client.', confidence: 0 };
    return res.json(localFallback);
  }

  try {
    const openaiResp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: `This is a user drawing image. Is this a drawing of a ${target}? Answer yes or no, with confidence.` },
              { type: 'input_image', image_url: image }
            ]
          }
        ]
      })
    });

    const data = await openaiResp.json();
    let text = '';
    if (data.output && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.content) {
          if (typeof item.content === 'string') text += item.content;
          if (Array.isArray(item.content)) {
            for (const part of item.content) {
              if (part.type === 'output_text' && part.text) text += part.text;
            }
          }
        }
      }
    }

    const match = /\b(yes|correct|match|matched)\b/i.test(text);
    let confidence = 0;
    const confidenceMatch = text.match(/(\d{1,3})%/);
    if (confidenceMatch) {
      confidence = Math.min(1, Number(confidenceMatch[1]) / 100);
    }

    return res.json({ match, text: text.trim(), confidence });
  } catch (e) {
    console.error('OpenAI recognition error', e);
    return res.status(500).json({ error: 'Recognition service error', detail: String(e) });
  }
});

// explicit route for each minigame so /reaction works without a trailing slash
app.get('/reaction', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/reaction/index.html'));
});

app.get('/typing', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/typing/index.html'));
});

app.get('/states', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/states/index.html'));
});

app.get('/wordle', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/wordle/index.html'));
});

app.get('/crabs', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/crabs/index.html'));
});

app.get('/dinohunt', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dinohunt/index.html'));
});

app.get('/drawnasourr', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/drawnasourr/index.html'));
});

app.get('/flappysaur', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/flappysaur/index.html'));
});

app.get('/findoursaurs', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/findoursaurs/index.html'));
});

app.get('/gockthon', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/gockthon/index.html'));
});

// ---------- Socket.IO for Gockthon multiplayer
const PLAYER_COLORS = ['#e45517', '#87d1ff', '#edca2d', '#4db87d', '#b17aff', '#ff8f5a'];

let players = {};
let turnOrder = [];
let turnIndex = 0;
let drawingState = { active: false, secondsLeft: 0, strokes: [] };
let drawingTimer = null;

function buildPlayerList() {
  return turnOrder.map((id, idx) => {
    const p = players[id];
    return { id, name: p.name, roleKnown: !!p.roleRevealed, role: p.roleRevealed ? p.role : 'Unknown', strokesUsed: p.strokesUsed, color: p.color };
  });
}

function broadcastState() {
  io.emit('state-update', {
    players: buildPlayerList(),
    currentTurnId: turnOrder[turnIndex] || null,
    drawing: drawingState.active,
    timeLeft: drawingState.secondsLeft,
    strokes: drawingState.strokes
  });
}

function advanceTurn() {
  if (turnOrder.length === 0) return;

  // if everyone has done one stroke, finalize the drawing
  const allDone = turnOrder.every((id) => players[id] && players[id].strokesUsed >= 1);
  if (allDone) {
    finishDrawing();
    return;
  }

  turnIndex = (turnIndex + 1) % turnOrder.length;
  let safety = turnOrder.length * 2;
  while (safety-- > 0) {
    const player = players[turnOrder[turnIndex]];
    if (player && player.strokesUsed < 1) break;
    turnIndex = (turnIndex + 1) % turnOrder.length;
  }
  broadcastState();
}

function finishDrawing() {
  drawingState.active = false;
  drawingState.secondsLeft = 0;
  clearInterval(drawingTimer);
  drawingTimer = null;
  io.emit('drawing-finished', drawingState.strokes);
  broadcastState();
}

io.on('connection', (socket) => {
  console.log('gockthon connection', socket.id);

  let role = 'Caveman';
  if (turnOrder.length === 0) role = 'Dino Imposter';

  const color = PLAYER_COLORS[turnOrder.length % PLAYER_COLORS.length];
  players[socket.id] = { id: socket.id, name: `Player ${Object.keys(players).length + 1}`, role, roleRevealed: false, strokesUsed: 0, color };
  turnOrder.push(socket.id);

  socket.emit('joined', { id: socket.id, role });
  broadcastState();

  socket.on('reveal-role', () => {
    if (!players[socket.id]) return;
    players[socket.id].roleRevealed = true;
    broadcastState();
  });

  socket.on('set-name', (name) => {
    if (!players[socket.id]) return;
    players[socket.id].name = String(name || 'Unnamed').slice(0, 24);
    broadcastState();
  });

  socket.on('start-drawing', () => {
    if (drawingState.active) return;
    if (turnOrder.length < 1) return;

    drawingState.active = true;
    drawingState.secondsLeft = 60;
    drawingState.strokes = [];

    Object.values(players).forEach((p) => { p.strokesUsed = 0; });
    turnIndex = 0;

    broadcastState();
    drawingTimer = setInterval(() => {
      drawingState.secondsLeft -= 1;
      if (drawingState.secondsLeft <= 0) {
        finishDrawing();
      } else {
        broadcastState();
      }
    }, 1000);
  });

  socket.on('draw-stroke', (stroke) => {
    if (!drawingState.active) return;
    if (!players[socket.id]) return;
    if (turnOrder[turnIndex] !== socket.id) return;

    const player = players[socket.id];
    if (player.strokesUsed >= 1) return;

    const normalizedStroke = { ...stroke, color: player.color, playerId: socket.id };
    drawingState.strokes.push(normalizedStroke);
    player.strokesUsed += 1;

    io.emit('stroke-added', normalizedStroke);

    // one stroke per turn
    advanceTurn();
  });

  socket.on('disconnect', () => {
    console.log('gockthon disconnect', socket.id);
    delete players[socket.id];
    turnOrder = turnOrder.filter((id) => id !== socket.id);
    if (turnIndex >= turnOrder.length) turnIndex = 0;
    if (turnOrder.length === 0) {
      if (drawingTimer) clearInterval(drawingTimer);
      drawingState.active = false;
      drawingState.secondsLeft = 0;
      drawingState.strokes = [];
      drawingTimer = null;
    }
    broadcastState();
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`); // log the URL once the server is ready
});
