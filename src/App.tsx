import { Design } from './design/Design'

export default function App() {
  return (
    <div className="min-h-screen bg-canvas p-4 md:p-8">
      <div className="mx-auto grid max-w-7xl gap-5">
        <Design />
      </div>
    </div>
  )
}
