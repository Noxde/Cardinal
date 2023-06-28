function ProfileInfo({ userProfile }) {
  return (
    <div className="info flex space-x-6">
      <div className="flex flex-col text-center justify-center">
        <span className="Gelion-Medium">{userProfile?.post_amount}</span>
        Posts
      </div>
      <div className="followers flex flex-col text-center justify-center">
        <span className="Gelion-Medium">{userProfile?.followers.length}</span>
        Followers
      </div>
      <div className="following flex flex-col text-center justify-center">
        <span className="Gelion-Medium">{userProfile?.following.length}</span>
        Following
      </div>
    </div>
  );
}

export default ProfileInfo;
