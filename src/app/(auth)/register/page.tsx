import RegisterForm from '@/components/auth/RegisterForm'
import Logo from '@/components/common/Logo'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
      {/* Decorative blurred circles for harbor theme */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-700 opacity-30 rounded-full blur-3xl -z-10" style={{ top: '-6rem', left: '-6rem' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl -z-10" style={{ bottom: '-6rem', right: '-6rem' }} />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-400 opacity-10 rounded-full blur-2xl -z-10" style={{ transform: 'translate(-50%, -50%)' }} />

      <div className="w-full max-w-md bg-white/70 rounded-xl shadow-xl p-8 backdrop-blur-md flex flex-col items-center">
        <Logo />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-900 drop-shadow-md">
          Register
        </h2>
        <p className="mt-2 mb-6 text-center text-base text-blue-800/80">
          Fill in your details to create your vendor account
        </p>
        <div className="w-full">
          {/* RegisterForm renders the form fields */}
          <RegisterForm />
        </div>
      </div>
    </div>
  )
} 