$.getJSON("/api/list", function(data) {
	console.log(data);

	$.each(data, function() {
		console.log(this);
		$("#inventory").append(`\
            <tr id="row-${this._id}">\
                <th id="name-${this._id}">${this.name}</th>\
                <td>${this.count}</td>\
                <td id="actions-${this._id}">\
                <a href="#!" class="button is-small is-rounded" onclick="update('${this._id}')">Update</a>\
                &emsp;\
                <a href="#!" class="button is-danger is-small is-rounded" onclick="destroy('${this._id}')">Delete</a>\
                </td>\
            </tr>`);
	});
});

function update(id) {
	$(`#actions-${id}`).html(`
        <div class="field has-addons">
            <div class="control">
                <input class="input is-small" type="text" placeholder="5/-5" id="count-${id}">
            </div>
            <div class="control">
                <a class="button is-danger is-small" href="#!" onclick="push('${id}')">
                    Update
                </a>
            </div>
        </div>
    `);
}

function push(id) {
	var data = {
		id: id,
		count: $(`#count-${id}`).val()
	};

    if (data.count) {
        $.ajax({
            type: "POST",
            url: "/api/update",
            data: data,
            success: (res) => {
                location.reload();
            }
        });
    }	
}

function destroy(id) {
    var r = confirm("Are you sure you want to delete " + $(`#name-${id}`).text() + "?");

    if (r) {
        var data = {
            id: id
        };

        $.ajax({
            type: "POST",
            url: "/api/delete",
            data: data,
            success: (res) => {
                location.reload();
            }
        });
    }
}

function create() {
    var data = {
        name: $("#add-name").val()
    }

    $.ajax({
		type: "POST",
		url: "/api/create",
		data: data,
		success: (res) => {
            location.reload();
        }
	});
}