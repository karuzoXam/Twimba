import { tweetsData } from './data.js';
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

const replyModal = document.getElementById('reply-modal');
let modalOpen = false;

document.addEventListener('click', function (e) {
    if (e.target.dataset.like) {
        handleLikeClick(e.target.dataset.like);
    } else if (e.target.dataset.retweet) {
        handleRetweetClick(e.target.dataset.retweet);
    } else if (e.target.dataset.reply) {
        handleReplyClick(e.target.dataset.reply);
    } else if (e.target.id === 'tweet-btn') {
        handleTweetBtnClick();
    } else if (e.target.id === 'reply-btn') {
        handleTweetReplyBtnClick(document.querySelector('.tweet').dataset.tweet, e.target);
    } else if (e.target.closest('#close-btn') || (!e.target.closest('#reply-modal') && modalOpen)) {
        closeModal();
    } 
});

function openModal() {
    replyModal.classList.remove('hidden');
    modalOpen = true;
}

function closeModal() {
    replyModal.classList.add('hidden');
    modalOpen = false;
}

function renderReplyMessage(replyMessage) {
    return `
    <div class="tweet-reply">
        <div class="tweet-inner">
            <img src="images/scrimbalogo.png" class="profile-pic">
            <div>
                <p class="handle">@BobDillon</p>
                <p class="tweet-text">${replyMessage}</p>
            </div>
        </div>
    </div>
    `;
}

function handleTweetReplyBtnClick(tweetId, target) {
    const targetTweetObj = tweetsData.find(tweet => tweet.uuid === tweetId);
    const replyInputField = document.getElementById('reply-input');
    const repliesArr = targetTweetObj.replies;
    const replyText = replyInputField.value;
    const replyObj = {
        handle: '@MaxMustermann ✅',
        profilePic: 'images/scrimbalogo.png',
        tweetText: replyText,
    };

    if (!replyText) return;
    replyInputField.value = '';
    repliesArr.unshift(replyObj);
    closeModal();
    render();
}

function handleLikeClick(tweetId) {
    if (modalOpen) {
        closeModal();
    }
    const targetTweetObj = tweetsData.find(tweet => tweet.uuid === tweetId);

    if (targetTweetObj.isLiked) {
        targetTweetObj.likes--;
    } else {
        targetTweetObj.likes++;
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked;
    render();
}

function handleRetweetClick(tweetId) {
    const targetTweetObj = tweetsData.find(tweet => tweet.uuid === tweetId);

    if (targetTweetObj.isRetweeted) {
        targetTweetObj.retweets--;
    } else {
        targetTweetObj.retweets++;
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted;
    render();

    if (modalOpen) {
        closeModal();
    }
}

function handleReplyClick(replyId) {
    const targetTweetObj = tweetsData.find(tweet => tweet.uuid === replyId);
    const repliesContainer = document.getElementById(`replies-${replyId}`);
    
    if (repliesContainer) {
        repliesContainer.classList.toggle('hidden');
    }

    if (modalOpen) {
        closeModal();
    } else {
        openModal();
    }

    const replyMarkup = `
    <div class="tweet margin-zero" data-tweet="${targetTweetObj.uuid}">
        <div class="tweet-inner">
            <img src="${targetTweetObj.profilePic}" class="profile-pic">
            <div>
                <p class="handle">${targetTweetObj.handle}</p>
                <p class="tweet-text">${targetTweetObj.tweetText}</p>
            </div>
        </div>
    </div>
    `;
    document.getElementById('tweet-container').innerHTML = replyMarkup;
}

function handleTweetBtnClick() {
    const tweetInput = document.getElementById('tweet-input');

    if (tweetInput.value) {
        tweetsData.unshift({
            handle: '@Scrimba',
            profilePic: 'images/scrimbalogo.png',
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4()
        });
        render();
        tweetInput.value = '';
    }
}

function getFeedHtml() {
    let feedHtml = '';

    tweetsData.forEach(tweet => {
        let likeIconClass = tweet.isLiked ? 'liked' : '';
        let retweetIconClass = tweet.isRetweeted ? 'retweeted' : '';
        let repliesHtml = '';

        if (tweet.replies.length > 0) {
            tweet.replies.forEach(reply => {
                repliesHtml += `
                <div class="tweet-reply">
                    <div class="tweet-inner">
                        <img src="${reply.profilePic}" class="profile-pic">
                        <div>
                            <p class="handle">${reply.handle}</p>
                            <p class="tweet-text">${reply.tweetText}</p>
                        </div>
                    </div>
                </div>
                `;
            });
        }

        feedHtml += `
        <div class="tweet" data-tweet="${tweet.uuid}">
            <div class="tweet-inner">
                <img src="${tweet.profilePic}" class="profile-pic">
                <div>
                    <p class="handle">${tweet.handle}</p>
                    <p class="tweet-text">${tweet.tweetText}</p>
                    <div class="tweet-details" id="tweet-details">
                        <span class="tweet-detail">
                            <i class="fa-regular fa-comment-dots"
                                data-reply="${tweet.uuid}"
                            ></i>
                            ${tweet.replies.length}
                        </span>
                        <span class="tweet-detail">
                            <i class="fa-solid fa-heart ${likeIconClass}"
                                data-like="${tweet.uuid}"
                            ></i>
                            ${tweet.likes}
                        </span>
                        <span class="tweet-detail">
                            <i class="fa-solid fa-retweet ${retweetIconClass}"
                                data-retweet="${tweet.uuid}"
                            ></i>
                            ${tweet.retweets}
                        </span>
                    </div>
                </div>
            </div>
            <div class="hidden" id="replies-${tweet.uuid}">
                ${repliesHtml}
            </div>
        </div>
        `;
    });

    return feedHtml;
}

function render() {
    document.getElementById('feed').innerHTML = getFeedHtml();
}
render();
