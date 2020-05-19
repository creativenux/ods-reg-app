var express = require('express'),
    mysql = require('mysql'),
    bodyParser = require('body-parser'),
    date = require('date-and-time');

var app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ods'
});
db.connect(err => {
    if(err) {
        throw err;
    }
    console.log('DB connection created.');
});

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/getParticipant', (req, res) => {
    var q = req.body.q;
    if(q) {
        var sql = "SELECT * FROM participants WHERE first_name LIKE '%"+q+"%' OR last_name LIKE '%"+q+"%' OR email LIKE '%"+q+"%' or phone LIKE '%"+q+"%'";
        db.query(sql, (err, result) => {
            if(err) {
                console.log('Error occurs: '+err);
                res.json({'err': 1, 'msg': err});
            } else {
                if(result[0]) {
                    res.json({'err': 0, 'result': result});
                } else {
                    res.json({'err': 1, 'msg': 'No participant with the details found.'});
                }
            }
        });
    }
});

app.post('/checkin', (req, res) => {
    var email = req.body.email;
    if(email) {
        var sql = "UPDATE participants SET status='Present', checkin_time=? WHERE email=?";
        db.query(sql, [date.format(new Date(), 'YYYY-MM-DD hh:mm A'), email], (err, result) => {
            if(err) {
                console.log('Error occurs: '+err);
                res.json({'err': 1, 'msg': err});
            } else {
                res.json({'err': 0});
            }
        });
    }
});

app.post('/reg', (req, res) => {
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var phone = req.body.phone;
    var gender = req.body.gender;
    if(first_name && last_name && email && phone && gender) {
        var sql = "INSERT INTO participants (first_name, last_name, phone, email, gender, order_id, order_date, checkin_time, qty, ticket_type, order_type, status) values(?,?,?,?,?,?,?,?,1,'Ogun Digital Summit Ticket','Free Order','Present')";
        db.query(sql, [first_name, last_name, phone, email, gender, new Date().getTime(), date.format(new Date(), 'YYYY-MM-DD hh:mm A'), date.format(new Date(), 'YYYY-MM-DD hh:mm A')], (err, result) => {
            if(err) {
                console.log('Error occurs: '+err);
                res.json({'err': 1, 'msg': 'Error saving details to database'});
            } else {
                res.json({'err': 0});
            }
        });
    }
});

var server = app.listen(8000, function() {
    console.log('App running on port 8000');
});
/*
var io = socket(server);
var checked_in = 0;
var connections = [];

io.on('connection', function(socket) {
    connections.push(socket);
    console.log('Client connected. Total clients: %s ', connections.length, socket.id);
    
    socket.on('check_in', function() {
        checked_in += 1;
        socket.broadcast.emit(checked_in);
    });
});
*/