function Comment({ author: { profilePicture, username }, content }) {
  return (
    <div className="flex items-start p-4">
      <img
        width={"50px"}
        src={profilePicture}
        alt=""
        className="rounded-full mr-4"
      />
      <div>
        <span className="Gelion-Medium">{username}</span>
        <p>{content}</p>
      </div>
      <span className="timestamp ml-auto">15min</span>
    </div>
  );
}

export default Comment;
