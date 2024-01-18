import { getAssetsUrl } from "@/utils/url";
import { Player } from "@lottiefiles/react-lottie-player";

export default () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Player
        className="h-32 w-32"
        autoplay
        loop
        src={getAssetsUrl("animations/loading.json")}
      />
    </div>
  );
};
