
import LeesprofielForm from "@/components/LeesprofielForm";
import TeacherSelector from "@/components/TeacherSelector";

export default function ProfielPage() {
  return (
    <main className="container">
      <h1>Mijn leesprofiel</h1>

      <p>
        Vertel ons wat je graag leest.
        Met jouw antwoorden kunnen we passende
        leesadviezen samenstellen.
      </p>

      <LeesprofielForm />

      <section aria-label="Docentkoppeling">
        <TeacherSelector />
      </section>
    </main>
  );
}
