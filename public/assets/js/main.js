var socket = io.connect('http://192.168.43.215:8001');

socket.on('checked_in', function(data) {
    $('#checkedin_no').text(data);
});

$BTN = $('form button');
$('form#search').on('submit', function(e) {
    e.preventDefault();
    $BTN.attr('disabled', '');
    $('tbody').empty();
    $('caption').html('<i class="fa fa-spinner fa-spin"></i> Fetching, please wait...');
    var q = $('form#search input').val().trim();
    if(q.length) {
        $.post('/getParticipant', {'q': q}, function(data) {
            if(typeof data == 'object') {
                if(data.err == 0) {
                    data.result.forEach(function(row) {
                        $('tbody').append(`<tr>
                            <td>${row.first_name}</td>
                            <td>${row.last_name}</td>
                            <td>${row.email}</td>
                            <td>${row.gender}</td>
                            <td>${row.phone}</td>
                            <td><button data-checkin="${row.email}" ${(row.status=='Present') ? 'disabled=""' : ''} type="button" class="btn btn-primary btn-sm">Check In</button></td>
                        </tr>`
                        );
                    });
                    $BTN.removeAttr('disabled');
                    $('form#search')[0].reset();
                    $('caption').text(data.result.length+ ' result(s) found');
                } else {
                    $BTN.removeAttr('disabled');
                    $('caption').html('<i class="fa fa-times"></i> '+data.msg);
                }
            }
        })
    } else {
        $BTN.removeAttr('disabled');
        $('caption').html('Awaiting to load participants details...');
    }
});

$('body').on('click', '[data-checkin]', function(e) {
    e.preventDefault();
    var email = $(this).data('checkin');
    $.post('/checkin', {'email': email}, function(data) {
        if(typeof data == 'object') {
            if(data.err == 0) {
                $(`button[data-checkin='${email}']`).attr('disabled', '');
                socket.emit('checked_in');
                alert('Checked in!');
            } else {
                alert('Error: '+data.msg);
            }
        }
    });
})

$('form#register').on('submit', function(e) {
    e.preventDefault();
    var btn = $('form#register button');
    $(btn).attr('disabled', '');
    $('.alert').show().html('<i class="fa fa-spinner fa-spin"></i> Submitting, please wait...');
    var first_name = $('form#register input[name=first_name]').val().trim();
    var last_name = $('form#register input[name=last_name]').val().trim();
    var email = $('form#register input[name=email]').val().trim();
    var phone = $('form#register input[name=phone]').val().trim();
    var gender = $('form#register select[name=gender]').val().trim();
    if(first_name && last_name && email && phone && gender) {
        $.post('/reg', {'first_name': first_name, 'last_name': last_name, 'email': email, 'phone': phone, 'gender': gender}, function(data) {
            if(data && typeof data == 'object') {
                if(data.err == 0) {
                    $(btn).removeAttr('disabled');
                    $('.alert').html('<i class="fa fa-check"></i> Registered and checked in.');
                    socket.emit('checked_in');
                    $('form#register')[0].reset();
                } else {
                    $(btn).removeAttr('disabled');
                    $('.alert').html('<i class="fa fa-times"></i> '+data.msg);
                }
            } else {
                $(btn).removeAttr('disabled');
                $('.alert').html('<i class="fa fa-times"></i> Invalid server response.');
            }
        });
    } else {
        $('.alert').html('<i class="fa fa-times"></i> Invalid input, check and try again.');
    }
});