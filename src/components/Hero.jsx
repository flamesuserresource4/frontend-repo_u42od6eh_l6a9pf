import Spline from '@splinetool/react-spline'

export default function Hero(){
  return (
    <div className="relative h-72 md:h-96 w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0b12]/20 to-[#0b0b12] pointer-events-none"/>
    </div>
  )
}
