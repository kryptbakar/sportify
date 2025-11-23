export function FootballPitch({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`relative w-full pitch-pattern rounded-lg overflow-hidden ${className}`}>
      {/* Center line */}
      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20 -translate-x-1/2" />
      
      {/* Center circle */}
      <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
      
      {/* Center spot */}
      <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white/40 rounded-full -translate-x-1/2 -translate-y-1/2" />
      
      {/* Left penalty area */}
      <div className="absolute top-1/4 left-0 w-24 h-1/2 border border-white/20" />
      
      {/* Right penalty area */}
      <div className="absolute top-1/4 right-0 w-24 h-1/2 border border-white/20" />
      
      {/* Left goal area */}
      <div className="absolute top-1/3 left-0 w-12 h-1/3 border border-white/30" />
      
      {/* Right goal area */}
      <div className="absolute top-1/3 right-0 w-12 h-1/3 border border-white/30" />
      
      {/* Children content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function FootballBall() {
  return (
    <div className="w-6 h-6 rounded-full bg-white shadow-lg animate-bounce-ball flex items-center justify-center">
      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-white to-gray-300 flex items-center justify-center text-xs font-bold text-black">
        ⚽
      </div>
    </div>
  );
}

export function GoalPost({ position = "left" }: { position?: "left" | "right" }) {
  return (
    <div className={`absolute top-1/2 w-1 h-32 bg-white/40 -translate-y-1/2 ${position === "left" ? "left-1" : "right-1"}`} />
  );
}

export function PlayerMarker({ name, team = "A" }: { name: string; team?: "A" | "B" }) {
  const colors = team === "A" 
    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white" 
    : "bg-gradient-to-br from-yellow-500 to-yellow-600 text-gray-900";
  
  return (
    <div className={`${colors} w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm animate-wiggle shadow-lg border-2 border-white/30`}>
      👤
    </div>
  );
}