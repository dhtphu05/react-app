import { cn } from "@/lib/utils"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-2 text-left">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label htmlFor="email" className="text-base font-medium">Email</label>
          <input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            className="!bg-white !text-black border shadow-sm  rounded-xl h-12 text-lg px-4"
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <label htmlFor="password" className="text-base font-medium">Password</label>
            <a
              href="#"
              className="!text-black ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <input
            id="password"
            type="password"
            required
            className="bg-white text-black border border-gray-200 shadow-sm focus:border-black focus:ring-black rounded-xl h-12 text-lg px-4"
          />
        </div>
        <button type="submit" className="w-full bg-neutral-900 text-white rounded-xl text-lg h-12 border border-gray-200 font-medium">Login</button>
        <button type="button" className="w-full !bg-white !text-black rounded-xl text-lg h-12 border !border-black font-medium mt-2">Login with Google</button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="#" className="!text-black underline underline-offset-4">
          Sign up
        </a>
      </div>
    </form>
  )
}
