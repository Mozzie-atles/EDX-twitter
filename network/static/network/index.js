document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#sent').addEventListener('click', () => send_post());
    document.querySelector('#follow_route').addEventListener('click', () => following_page(current_page, row));
    document.querySelector('#text').value = '';
    document.querySelector('#edit-post').style.display = 'none'


    all_post(current_page, row);
})


function send_post() {
    var artical = document.querySelector('#text').value;

    if (artical != '') {
        fetch('/network', {
            method: 'POST',
            body: JSON.stringify({
                content: artical,
            })
        })
            .then(response => response.json())
            .then(result => {
                console.log(result)

            })



    } else {
        var msg = document.querySelector('#message-box')
        msg.style.display = 'block'
        msg.innerHTML = "you can't post empty articals!"
    }
}


let row = 10;
let current_page = 1;

function all_post(page, rows_per_page) {
    document.querySelector("#profile-div").style.display = 'none'
    document.querySelector("#unfollow-btn").style.display = 'none';
    document.querySelector('#edit-post').style.display = 'none'
    const page_div = document.querySelector("#allpage");
    const page_btn = document.querySelector('#paginate');

    page_div.innerHTML = ""


    fetch('/allposts')
        .then(response => response.json())
        .then(posts => {
            console.log(posts)
            page--;
            let start = rows_per_page * page;
            let end = start + rows_per_page;
            let paginatedItems = posts.slice(start, end);

            if (posts.length != 0) {
                let page_count = Math.ceil(posts.length / rows_per_page);
                for (let j = 1; j < page_count + 1; j++) {
                    let btn = page_setup(j);
                    page_btn.appendChild(btn);
                }
                for (i = 0; i < paginatedItems.length; i++) {
                    let post = paginatedItems[i];
                    console.log(post)
                    const id = document.createElement('input');
                    id.type = 'hidden';
                    const heart = document.createElement('button');
                    heart.className = 'hearts'
                    const card_div = document.createElement('div');
                    card_div.className = "card bg-light mb-3";
                    card_div.style = "max-width: 50rem;"
                    const card_sender = document.createElement('div');
                    card_sender.className = "card-header";
                    const card_body = document.createElement("div");
                    card_body.className = "card-body";
                    const card_content = document.createElement('h4');
                    card_content.className = "card-title";
                    const post_time = document.createElement('p');
                    post_time.className = "card-text";
                    const edit = document.createElement('button');
                    edit.className = 'btn btn-dark'
                    edit.innerHTML = 'Edit'
                    edit.style.display = 'none'



                    card_sender.type = 'button'
                    id.value = post["id"]
                    id.id = post["id"]
                    card_sender.value = post["user"]
                    card_sender.innerHTML = post["user"];
                    card_content.innerHTML = post["content"];
                    post_time.innerHTML = post["timestamp"];
                    fetch('/edit')
                        .then(response => response.json())
                        .then(data => {

                            console.log(card_sender.value)
                            if (data === card_sender.value) {
                                edit.style.display = 'block'
                            }

                        })


                    fetch('/like', {
                        method: "POST",
                        body: JSON.stringify({
                            pk: post["id"],
                            status: 'check',
                        })

                    })
                        .then(response => response.json())
                        .then(result => {
                            console.log(result)
                            if (result["message"] === "NO liked post.") {
                                heart.innerHTML = "<svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi - heart' fill='currentColor'xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z' /></svg >"
                                heart.addEventListener('click', () => like(id.value));
                            } else if (result["message"] === "Post exist.") {
                                heart.innerHTML = "<svg width='1em' height='1em' viewBox='0 0 16 16' class='bi bi-heart-fill' fill='currentColor' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' d='M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z'/></svg>"
                                heart.addEventListener('click', () => unlike(id.value));
                            }
                        })


                    page_div.appendChild(card_div);
                    card_div.appendChild(card_sender);
                    card_div.appendChild(card_body);
                    card_body.appendChild(id)
                    card_body.appendChild(card_content);
                    card_body.appendChild(post_time);
                    card_body.appendChild(heart);
                    card_body.appendChild(edit);

                    card_sender.addEventListener('click', () => profile());
                    edit.addEventListener('click', () => edits(card_content.innerHTML, id.value));
                }
            }
        })
}


function profile() {
    var tar = event.target
    var username = tar.innerHTML;
    var follower = document.querySelector('#follower-number');
    var following = document.querySelector('#following-number');
    const profile_div = document.querySelector("#post_body");
    var count1 = 0
    var count2 = 0


    console.log(tar.innerHTML);
    document.querySelector("#allpage").style.display = 'none';
    document.querySelector("#post-form").style.display = 'none';
    document.querySelector("#paginate").style.display = 'none';

    document.querySelector('h1').innerHTML = username;
    var follow_button = document.querySelector("#follow-btn")
    var unfollow_button = document.querySelector("#unfollow-btn")
    fetch(`profile/${username}`)
        .then(response => response.json())
        .then(result => {
            document.querySelector("#profile-div").style.display = 'block'

            follow_button.addEventListener('click', () => follow(username, 'follow'));

            if (result != '') {

                for (user of result) {
                    //check if user is following profile user or not
                    console.log(user);
                    if (user['user'] !== `${username}` && user['userfollowing'][0] === `${username}`) {
                        count1 += 1
                        follower.innerHTML = `Follower: ${count1}`
                    }

                    else if (user["user"] === `${username}` && user['userfollowing'] !== `${username}`) {
                        count2 += 1
                        following.innerHTML = `Following:${count2}`
                    }
                    if (count1 === 0) {
                        follower.innerHTML = `Follower: 0`
                    }
                    if (count2 === 0) {
                        following.innerHTML = `Following: 0`
                    }

                }
            } else {
                follower.innerHTML = `Follower: 0`
                following.innerHTML = 'Following: 0'
            }

            fetch(`/follow`, {
                method: "POST",
                body: JSON.stringify({
                    name: username,
                    state: 'check'
                })
            })
                .then(response => response.json())
                .then(info => {
                    if (info['message'] === 'error') {
                        document.querySelector('#follow-btn').innerHTML = 'Unfollow'
                        console.log("Already following")
                        follow_button.style.display = 'none'
                        unfollow_button.style.display = 'block'
                        document.querySelector("#unfollow-btn").addEventListener('click', () => unfollow(username, 'unfollow'))
                    } else if (info['message'] === 'self') {
                        follow_button.style.display = 'none'
                    } else {
                        console.log(info)
                    }
                })
            fetch('/allposts')
                .then(response => response.json())
                .then(posts => {
                    for (post in posts) {
                        if (posts[post]['user'] === `${username}`) {
                            console.log('OK')
                            const card_div = document.createElement('div');
                            card_div.className = "card bg-light mb-3";
                            card_div.style = "max-width: 18rem;"
                            const card_sender = document.createElement('div');
                            card_sender.className = "card-header";
                            const card_body = document.createElement("div");
                            card_body.className = "card-body";
                            const card_content = document.createElement('h4');
                            card_content.className = "card-title";
                            const post_time = document.createElement('p');
                            post_time.className = "card-text";

                            card_sender.innerHTML = posts[post]['user'];
                            card_content.innerHTML = posts[post]['content'];
                            post_time.innerHTML = posts[post]['timestamp'];


                            profile_div.appendChild(card_div);
                            card_div.appendChild(card_sender);
                            card_div.appendChild(card_body);
                            card_body.appendChild(card_content);
                            card_body.appendChild(post_time);


                        }

                    }
                })

        })

}


function follow(username, state) {

    if (state === 'follow') {

        fetch(`/follow`, {
            method: "POST",
            body: JSON.stringify({
                name: username,
                state: 'follow',
            })
        })
            .then(response => response.json())
            .then(info => {
                console.log(info);
            })
    }
}
function unfollow(username, state) {
    if (state === 'unfollow') {
        fetch(`/follow`, {
            method: "POST",
            body: JSON.stringify({
                name: username,
                state: 'unfollow',
            })
        })
            .then(response => response.json())
            .then(info => {
                console.log(info);
            })
    }
}

function following_page(page, rows_per_page) {

    const page_btn = document.querySelector('#paginate');


    document.querySelector("#profile-div").style.display = 'none'
    document.querySelector("#post-form").style.display = 'none'
    document.querySelector("#allpage").style.display = 'none'
    document.querySelector('#edit-post').style.display = 'none'
    document.querySelector('#title').innerHTML = 'Following'
    const page_div = document.querySelector("#followpage");
    document.querySelector("#paginate").style.display = 'block';
    page_div.innerHTML = ''
    page_btn.innerHTML = ''

    fetch('follow/post')
        .then(response => response.json())
        .then(result => {
            // console.log(result)
            page--;
            let start = rows_per_page * page;
            let end = start + rows_per_page;
            let paginatedItems = result.slice(start, end);
            let page_count = Math.ceil(result.length / rows_per_page);
            for (let j = 1; j < page_count + 1; j++) {
                let btn = page_setup(j);
                page_btn.appendChild(btn);
            }

            for (i = 0; i < paginatedItems.length; i++) {
                let posts = paginatedItems[i];
                for (post in posts) {

                    console.log(posts[post])
                    const card_div = document.createElement('div');
                    card_div.className = "card bg-light mb-3";
                    card_div.style = "max-width: 18rem;"
                    const card_sender = document.createElement('div');
                    card_sender.className = "card-header";
                    const card_body = document.createElement("div");
                    card_body.className = "card-body";
                    const card_content = document.createElement('h4');
                    card_content.className = "card-title";
                    const post_time = document.createElement('p');
                    post_time.className = "card-text";

                    card_sender.innerHTML = posts[post]['user'];
                    card_content.innerHTML = posts[post]['content'];
                    post_time.innerHTML = posts[post]['timestamp'];


                    page_div.appendChild(card_div);
                    card_div.appendChild(card_sender);
                    card_div.appendChild(card_body);
                    card_body.appendChild(card_content);
                    card_body.appendChild(post_time);
                    page_div.style.display = 'block'
                }
            }


        })
}

function like(id) {
    var pk = document.getElementById(`${id}`);
    console.log(pk.id)
    fetch('/like', {
        method: "POST",
        body: JSON.stringify({
            pk: pk.id,
            status: 'like',
        })

    })
        .then(response => response.json())
        .then(result => {
            console.log(result)
        })
}

function unlike(id) {
    var pk = document.getElementById(`${id}`);
    console.log(pk.id)
    fetch('/like', {
        method: "POST",
        body: JSON.stringify({
            pk: pk.id,
            status: 'unlike',
        })

    })
        .then(response => response.json())
        .then(result => {
            console.log(result)
        })
}

function edits(content, id) {
    document.querySelector('#allpage').style.display = 'none'
    document.querySelector("#paginate").style.display = 'none';
    document.querySelector('#post-form').style.display = 'none'
    document.querySelector('#title').innerHTML = 'Edit'
    document.querySelector('#edit-post').style.display = 'block'
    document.querySelector('#edit-text').innerHTML = content
    document.querySelector('#save-edit').addEventListener('click', () => save(id))
}
function save(id) {
    temp = document.querySelector('#edit-text').value
    fetch('edit', {
        method: "POST",
        body: JSON.stringify({
            id: id,
            content: temp,
        })
    })
        .then(response => response.json())
        .then(result => {
            console.log(result)
        })

}
function page_setup(page) {
    let button = document.createElement('button');



    button.innerText = page
    if (current_page === page) button.classList.add('active')
    button.addEventListener('click', function () {
        document.querySelector('#paginate').innerHTML = ""
        current_page = page;
        all_post(current_page, row);
    })

    return button;
}
