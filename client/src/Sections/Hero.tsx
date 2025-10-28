import { Highlighter } from "../components/ui/highlighter"
import { useNavigate } from "react-router-dom"
const Hero = () => {
  const navigate = useNavigate()
  return (
          <div className='flex flex-col items-center justify-center h-screen bg-black text-white' style={{backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(88, 28, 135, 0.8), transparent 70%)'}}>
        <h1 className='text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)] max-w-2xl'>
        You bring the clips
        <br />
        We bring the curse
      </h1>
      <p>
  The{" "}
  <Highlighter action="underline" color="#FF9800">
    Magic UI Highlighter
  </Highlighter>{" "}
  makes important{" "}
  <Highlighter action="highlight" color="#87CEFA">
    text stand out
  </Highlighter>{" "}
  effortlessly.
</p>
<button onClick={() => navigate('/editor')} className='mt-6 bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-md transition-colors'>
          Get started
</button>
    </div>
  )
}

export default Hero