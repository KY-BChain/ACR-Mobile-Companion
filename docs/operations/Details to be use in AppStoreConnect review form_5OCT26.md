> **How to use D4, D5 and D7.** Each gives one block of indented text. **Paste the indented text
> only** — the headings, dates and explanations around it are for us, never for Apple. In D5,
> replace `[CODE]` with the live invite code before saving.

**D4 — "What to test", rewritten 3 October 2026** (third revision — now with the actual
navigation, checked against the build):

> **Reaching the walk-through**
>
> 1. Open ACR Companion. The opening poster appears. **READ DETAILS** on that poster opens the
>    reviewer manual, which is also in **About**, in eight languages.
> 2. Continue to **Before you begin**. It carries the notice that only synthetic data may be used.
>    Tap **I understand — Begin**.
> 3. The **Evaluation access** screen appears. Set the mode selector to **Synthetic demonstration**.
>    The alternative setting is for invited clinical reviewers holding an access code.
> 4. Continue into the assessment.
>
> **The five screens and the twenty fields**
>
> 5. **Receptor status** — then **Next**.
> 6. **Tumour characteristics** — then **Next**.
> 7. **Biomarkers** — then **Next**.
> 8. **Provisional P1** — then **Next**.
> 9. **Provisional P2** — then **Next**.
> 10. **Review** — "Confirm entries before submission". Check every entry, then **Submit**.
>
> **What we would like you to look at:** the wording of each parameter, the order the questions are
> asked in, the explanation given for each one, and whether anything differs from what you would
> expect clinically. The language can be changed at any time from the opening screen; all eight are
> worth a glance.
>
> **About results.** Entering and reviewing all twenty fields needs no account, no code and no
> network connection. **Returning a result does** — whether live inference or the stored
> demonstration case, both are produced by our research service. Without a code the app completes the
> whole walk-through and states plainly that no result can be returned. That is correct behaviour and
> not a fault. If you have been given an optional access code, enter it at **Evaluation access** to
> see a result with its full explanation.

**D5 — App Review information, rewritten 3 October 2026** (second revision, external testing only):

> **No account or sign-in is needed to use and assess this app.**
>
> An optional access code, if you wish to see a result as well: **[CODE]**
>
> ACR Companion is intended for public release on the App Store. It is a practice and reference
> companion to the ACR Platform research website, for clinicians, multidisciplinary team members,
> clinical researchers and students.
>
> Open the app and walk through all five
> screens and all twenty fields: receptor status, tumour characteristics, biomarkers, and two
> provisional assessments, ending at a review screen. This needs no code and no network connection.
>
> To reach it: opening poster → **I understand — Begin** → on **Evaluation access** choose
> **Synthetic demonstration** → the five screens → **Review**.
>
> **Returning a result is a separate, optional service.** Both live inference and the stored
> demonstration case are produced by our research reasoning service, for invited clinical reviewers
> holding an access code. Without one the app completes the whole walk-through and states that no
> result can be returned — correct behaviour, not a fault. If you would like to see a result as well,
> an optional code is: **[CODE]**
>
> The app is a research prototype under clinical evaluation. It is not a medical device, it makes no
> diagnostic claim, and every screen carries a notice saying so. It is not intended for use with real
> patients and no patient data should be entered.

**Editorial note — NOT for Apple. Do not paste anything below this line into any field.**

> **Why these were rewritten, twice.** The originals said the app "is not offered for sale or public
> download" and described it only as a research prototype. Apple read that, concluded TestFlight was
> the wrong channel, and refused the build under **Guideline 2.2 — Beta Testing** without ever opening
> it. That sentence was true of the evaluation but wrong about the product: ACR Companion **is**
> intended for App Store release.
>
> The second revision, the same day, went further. The app's function is now stated as what it
> actually is — **a practice and reference companion to the ACR Platform website**, complete and
> working with no account, no code and no network. The reasoner is disclosed but demoted to an
> optional extra. Kraken's reasoning, and it is right: claiming the reasoner as core functionality
> opens two fronts Apple cannot verify — the invite code and a backend that runs on a laptop — and
> invites a **Guideline 2.1** refusal for incomplete functionality the moment either is unavailable.
> Defined as a reference companion, nothing is missing and there is no 2.1 case to answer.
>
> **The reasoner is disclosed, not hidden.** The app contains a visible access screen and a reviewer
> will find it; undisclosed functionality is its own refusal. It is named in all three texts as an
> optional service for invited clinical reviewers.

**D6 — the tester group. Done, 20 September 2026.** The internal group is named `CRIL`. **The public
link stays switched off.** A public link would make the build available to anyone holding the URL,
which is exactly what must not happen.

**D7 — "Beta App Description", rewritten 3 October 2026** (second revision; added 1 October). A
separate field from D4, on the same Test Information page. D4 says what to *do*; this says what the
app *is*. It is shown to testers in TestFlight, so it is written for them, not for Apple:

> ACR Companion is a practice and reference companion to the ACR Platform, a clinical research
> website for breast cancer assessment, developed by Cornerstone Research International Ltd with
> University College Dublin, Ireland, and Zhengzhou University, People's Republic of China.
>
> It guides you through five structured screens covering the twenty assessment parameters used in the
> pathway — receptor status, tumour characteristics and biomarkers — explaining what each one is and
> how they relate to one another. It is a way to learn and rehearse the assessment, in eight
> languages.
>
> It is intended for release on the App Store for clinicians, multidisciplinary team members,
> clinical researchers and students.
>
> **The whole walk-through works without an account, without a code and without a network
> connection**: all five screens, all twenty fields, every explanation, and the reviewer manual in
> eight languages.
>
> Returning an assessment result is a separate service. Invited clinical reviewers can be given an
> access code that connects the app to our research reasoning service, for live inference or for a
> stored demonstration case. Without a code the app completes the walk-through as designed and says that no
> result can be returned.
>
> It is a research prototype under evaluation. It is not a medical device, it makes no diagnostic
> claim, and it must not be used in the care of any patient. No patient data should be nor allow entered at any
> point.

**On the other fields of that page:** screenshots and an app category belong to the **App Store
listing**, not to Beta App Review, and are not required for external testing. If App Store Connect
asks for them, check that the page really is Test Information. Fill only what Apple marks as
required; leave the rest empty rather than inventing content.

**On a licence agreement:** none is supplied. Apple's standard licence covers a TestFlight build, and
the app's own terms are published at `https://www.acragent.com/terms.html` and linked in the app. Do
not confuse this with the **Program License Agreement** at A2, which is Apple's agreement with CRIL
as a developer and was accepted long ago.