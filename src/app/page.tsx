import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 p-6">
      <h1 className="text-3xl font-semibold">zDoma</h1>
      <p className="text-neutral-600">Spremljanje okrevanja na domu po odpustu iz bolnišnice.</p>
      <Link href="/patient" className="rounded-lg border p-4">
        Pacient
      </Link>
      <Link href="/nurse" className="rounded-lg border p-4">
        Medicinska sestra
      </Link>
    </main>
  );
}
