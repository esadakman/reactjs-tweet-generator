import { useState, createRef, useEffect } from "react";
import { useScreenshot } from "use-react-screenshot";
import "./App.scss";
import {
  LikeIcon,
  ReplyIcon,
  RetweetIcon,
  ShareIcon,
  VerifiedIcon,
} from "./icons";
import { AvatarLoader } from "./loader";

function convertImgToBase64(url, callback, outputFormat) {
  var canvas = document.createElement("CANVAS");
  var ctx = canvas.getContext("2d");
  var img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = function () {
    canvas.height = img.height;
    canvas.width = img.width;
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL(outputFormat || "image/png");
    callback.call(this, dataURL);
    // Clean up
    canvas = null;
  };
  img.src = url;
}

const tweetFormat = (tweet) => {
  tweet = tweet
    .replace(/@([\w]+)/g, "<span>@$1</span>")
    .replace(/#([\wşçöğüıİ]+)/gi, "<span>#$1</span>")
    .replace(/(https?:\/\/[\w\.\/]+)/, "<span>$1</span>");
  return tweet;
};

const formatNumber = (number) => {
  if (number < 1000) {
    return number;
  }
  number /= 1000;
  number = String(number).split(".");
  return (
    number[0] + (number[1] > 100 ? "," + number[1].slice(0, 1) + " B" : " B")
  );
};

function App() {
  const tweetRef = createRef(null);
  const downloadRef = createRef(null);
  const [name, setName] = useState();
  const [userName, setUserName] = useState();
  const [isVerified, setIsVerified] = useState(false);
  const [tweet, setTweet] = useState();
  const [avatar, setAvatar] = useState();
  const [retweets, setRetweets] = useState(0);
  const [quoteTweets, setQuoteTweets] = useState(0);
  const [likes, setLikes] = useState(0);
  const [image, takeScreenshot] = useScreenshot();
  const [langText, setLangText] = useState();

  const getImage = () => takeScreenshot(tweetRef.current);

  useEffect(() => {
    if (image) {
      downloadRef.current.click();
    }
  }, [image]);

  const avatarHandle = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", function () {
      setAvatar(this.result);
    });
    reader.readAsDataURL(file);
  };

  const fetchTwitterInfo = () => {
    fetch(
      `https://typeahead-js-twitter-api-proxy.herokuapp.com/demo/search?q=${userName}`
    )
      .then((res) => res.json())
      .then((data) => {
        const twitter = data[0];
        console.log(twitter);

        convertImgToBase64(
          twitter.profile_image_url_https,
          function (base64Image) {
            setAvatar(base64Image);
          }
        );
        setName(twitter.name);
        setUserName(twitter.screen_name);
        setTweet(twitter.status.text);
        setRetweets(twitter.status.retweet_count);
        setLikes(twitter.status.favorite_count);
      });
  };

  return (
    <>
      <div className="tweet-settings">
        <h3>Tweet Ayarları</h3>
        <ul>
          <li>
            <label>Name Surname</label>
            <input
              className="input"
              type="text"
              // placeholder="Name Surname"
              value={name || ""}
              onChange={(e) => setName(e.target.value)}
            />
          </li>
          <li>
            <label>Username</label>
            <input
              className="input"
              type="text"
              // placeholder="Username"
              value={userName || ""}
              onChange={(e) => setUserName(e.target.value)}
            />
          </li>
          <li>
            <label>Tweet</label>
            <textarea
              className="textarea"
              type="text"
              maxLength="290"
              // placeholder="Tweet"
              value={tweet || ""}
              onChange={(e) => setTweet(e.target.value)}
            />
          </li>
          <li>
            <label>Avatar</label>
            <input className="input" type="file" onChange={avatarHandle} />
          </li>
          <li>
            <label>Retweet</label>
            <input
              className="input"
              type="number"
              // placeholder="Retweet"
              value={retweets || ""}
              onChange={(e) => setRetweets(e.target.value)}
            />
          </li>
          <li>
            <label>Quote Tweets</label>
            <input
              className="input"
              type="number"
              // placeholder="Quote Tweets"
              value={quoteTweets || ""}
              onChange={(e) => setQuoteTweets(e.target.value)}
            />
          </li>
          <li>
            <label>Likes</label>
            <input
              className="input"
              type="number"
              // placeholder="Like"
              value={likes || ""}
              onChange={(e) => setLikes(e.target.value)}
            />
          </li>
          <button onClick={getImage}>Oluştur</button>
          <div className="download-url">
            {image && (
              <a ref={downloadRef} href={image} download="tweet.png">
                Tweeti İndir
              </a>
            )}
          </div>
        </ul>
      </div>
      <div className="tweet-container">
        <div className="fetch-info">
          <input
            type="text"
            value={userName || ""}
            placeholder="Twitter kullanıcı adını yazın"
            onChange={(e) => setUserName(e.target.value)}
          />
          <button onClick={fetchTwitterInfo}>Bilgileri Çek</button>
        </div>

        <div className="tweet" ref={tweetRef}>
          <div className="tweet-author">
            {(avatar && <img src={avatar} alt="avatar" />) || <AvatarLoader />}
            <div>
              <div className="name">
                {name || "name"}
                {isVerified && <VerifiedIcon width="19" height="19" />}
              </div>
              <div className="username">@{userName || "username"}</div>
            </div>
          </div>
          <div className="tweet-content">
            <p
              dangerouslySetInnerHTML={{
                __html: (tweet && tweetFormat(tweet)) || "example tweet here",
              }}
            ></p>
          </div>
          <div className="tweet-stats">
            <span>
              <b>{formatNumber(retweets)}</b> Retweet
            </span>
            <span>
              <b>{formatNumber(quoteTweets)}</b> Alıntı Tweetler
            </span>
            <span>
              <b>{formatNumber(likes)}</b> Beğeni
            </span>
          </div>
          <div className="tweet-actions">
            <span>
              <ReplyIcon />
            </span>
            <span>
              <RetweetIcon />
            </span>
            <span>
              <LikeIcon />
            </span>
            <span>
              <ShareIcon />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
