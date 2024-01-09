function NoChats({ showFollowers }) {
  return (
    <div className="p-4 h-2/3 flex flex-col justify-center items-center">
      <p className="Gelion-Medium dark-blue text-xl max-w-xs text-center">
        You have no open chats, start a new one with one of your followers
      </p>
      <div className="flex flex-col justify-center items-center text-[#3C3D44] Gelion-Regular">
        <button
          onClick={() => {
            showFollowers(true);
          }}
          className="bg-[#4558ff] rounded-full text-white Gelion-Medium py-2 px-6 mt-4"
        >
          Start a new chat{" "}
        </button>
        <span className="text-xs">
          or <button className="underline">search</button> for someone
        </span>
      </div>
    </div>
  );
}

export default NoChats;
