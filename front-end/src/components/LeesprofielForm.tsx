"use client";

import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import {
  emptyProfile,
  profileKeys,
  pickProfile,
  isReadingProfile,
  type ReadingProfile,
} from "@/lib/profile";

import SelectField from "./SelectField";
import Link from "next/link";

const vragen: {
  id: keyof ReadingProfile;
  label: string;
  options: string[];
}[] = [
  {
    id: "niveau",
    label: "Hoe moeilijk mag het zijn?",
    options: ["Makkelijk", "Gemiddeld", "Uitdagend"],
  },
  {
    id: "genre",
    label: "Welk genre spreekt je aan?",
    options: [
      "Spanning",
      "Horror",
      "Humor",
      "Liefde",
      "Vriendschap",
      "Fantasy",
      "Science fiction",
      "Geschiedenis",
      "Oorlog",
      "Stripboek",
      "Gedichtenbundel",
    ],
  },
  {
    id: "onderwerp",
    label: "Waarover zou je willen lezen?",
    options: [
      "Sport of andere hobby's",
      "Geld",
      "School",
      "Technologie",
      "Liefde",
      "Vriendschap",
      "Cultuur",
      "Dieren",
      "Games",
    ],
  },
  {
    id: "lengte",
    label: "Hoe lang mag het zijn?",
    options: ["Korte verhalen of teksten", "Middel", "Lang"],
  },
  {
    id: "leesdoel",
    label: "Waarom lees je?",
    options: [
      "Nieuwe werelden ontdekken",
      "Aan het denken worden gezet",
      "Iets leren",
      "Een betere of snellere lezer worden",
      "Mijn kansen op schoolsucces vergroten",
      "Ik wil niet lezen",
    ],
  },
];

export default function LeesprofielForm() {
  const { session } = useAuth();

  const userId = session?.user.id;
  const token = session?.token;

  const [profiel, setProfiel] = useState<ReadingProfile>(emptyProfile);
  const [savedProfile, setSavedProfile] =
    useState<ReadingProfile>(emptyProfile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [draftWarning, setDraftWarning] = useState("");
  const [retry, setRetry] = useState(0);

  // Concepten worden per student bewaard
  const draftKey = `vrijlezen-profiel-concept-${userId}`;

  const isDirty = profileKeys.some(
    (key) => profiel[key] !== savedProfile[key]
  );

  // Haal het opgeslagen profiel op uit PostgreSQL
  useEffect(() => {
    if (!token || !userId) return;

    const controller = new AbortController();

    async function loadProfile() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/profiel`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Je sessie is verlopen. Log opnieuw in."
              : "Je leesprofiel kon niet worden geladen."
          );
        }

        const data = (await response.json()) as {
          profile: ReadingProfile | null;
        };

        const fromServer = data.profile
          ? pickProfile(data.profile)
          : { ...emptyProfile };

        let initialProfile = fromServer;

        // Herstel eventuele niet-opgeslagen wijzigingen
        try {
          const stored = localStorage.getItem(
            `vrijlezen-profiel-concept-${userId}`
          );

          if (stored) {
            const parsed: unknown = JSON.parse(stored);

            if (isReadingProfile(parsed)) {
              initialProfile = pickProfile(parsed);
            }
          }
        } catch {
          setDraftWarning(
            "Een eerder concept kon niet worden hersteld."
          );
        }

        if (controller.signal.aborted) return;

        setSavedProfile(fromServer);
        setProfiel(initialProfile);
        setLoadError("");
      } catch (err) {
        if (controller.signal.aborted) return;

        setLoadError(
          err instanceof Error
            ? err.message
            : "Er is iets misgegaan."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => controller.abort();
  }, [token, userId, retry]);

  // Waarschuw bij sluiten of vernieuwen met wijzigingen
  useEffect(() => {
    if (!isDirty || loading) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [isDirty, loading]);

  function wijzigVeld(
    field: keyof ReadingProfile,
    value: string
  ) {
    const updated = {
      ...profiel,
      [field]: value,
    };

    setProfiel(updated);
    setError("");
    setMessage("");

    // Alleen als concept opslaan, nog niet in PostgreSQL
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify(updated)
      );
      setDraftWarning("");
    } catch {
      setDraftWarning(
        "Je concept kon niet in deze browser worden bewaard."
      );
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!token) {
      setError("Log opnieuw in om je profiel op te slaan.");
      return;
    }

    if (
      profileKeys.some((key) => !profiel[key].trim())
    ) {
      setError("Vul alle verplichte velden in.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const cleanProfile = pickProfile(profiel);

      const response = await fetch(
        `${API_BASE_URL}/api/profiel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(cleanProfile),
        }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Je sessie is verlopen. Log opnieuw in."
            : "Opslaan is mislukt. Probeer het opnieuw."
        );
      }

      setSavedProfile(cleanProfile);
      setProfiel(cleanProfile);

      try {
        localStorage.removeItem(draftKey);
        setDraftWarning("");
      } catch {
        setDraftWarning(
          "Het oude browserconcept kon niet worden verwijderd."
        );
      }

      setMessage("Je leesprofiel is succesvol opgeslagen!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Opslaan is mislukt."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    if (!isDirty) return;

    const confirmed = window.confirm(
      "Weet je zeker dat je de niet-opgeslagen wijzigingen wilt weggooien?"
    );

    if (!confirmed) return;

    setProfiel({ ...savedProfile });
    setError("");
    setMessage("Wijzigingen geannuleerd.");

    try {
      localStorage.removeItem(draftKey);
      setDraftWarning("");
    } catch {
      setDraftWarning(
        "Het browserconcept kon niet worden verwijderd."
      );
    }
  }

  if (loading) {
    return <p role="status">Leesprofiel laden...</p>;
  }

  if (loadError) {
    return (
      <div className="catalog-message" role="alert">
        <p>{loadError}</p>
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setLoading(true);
            setRetry((previous) => previous + 1);
          }}
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <p>Alle velden met een * zijn verplicht.</p>

      <fieldset className="profile-fields" disabled={saving}>
        {vragen.map((vraag) => (
          <SelectField
            key={vraag.id}
            id={vraag.id}
            label={vraag.label}
            value={profiel[vraag.id]}
            options={vraag.options}
            onChange={(value) =>
              wijzigVeld(vraag.id, value)
            }
          />
        ))}
      </fieldset>

      {isDirty && (
        <p className="unsaved-notice" role="status">
          Je hebt niet-opgeslagen wijzigingen.
        </p>
      )}

      <div className="profile-actions">
        <button
          type="submit"
          className="primary-button"
          disabled={saving || !isDirty}
        >
          {saving ? "Opslaan..." : "Leesprofiel opslaan"}
        </button>

        <button
          type="button"
          className="pagination-button"
          onClick={handleDiscard}
          disabled={saving || !isDirty}
        >
          Wijzigingen annuleren
        </button>
      </div>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {draftWarning && (
        <p className="error-message" role="alert">
          {draftWarning}
        </p>
      )}

      {message && <p role="status">{message}</p>}

      {message === "Je leesprofiel is succesvol opgeslagen!" && (
        <Link
          href="/advies"
          className="primary-button button-link"
        >
          Bekijk mijn leesadvies
        </Link>
      )}
    </form>
  );
}
