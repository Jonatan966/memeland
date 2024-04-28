import { Badge } from "../ui/badge";

export function MemeCard() {
  return (
    <div
      className="relative cursor-pointer border hover:border-green-500 mb-4"
      onClick={() => alert("card")}
    >
      <img
        src="https://github.com/rocketseat.png"
        alt="Photo"
        className="w-full aspect-square"
      />

      <div className="absolute inset-0 flex items-start">
        <Badge>Vídeo</Badge>
      </div>
      {/* <div className="absolute inset-0 opacity-0 hover:opacity-100">
        <button>Botão</button>
      </div> */}
    </div>
  );
}
