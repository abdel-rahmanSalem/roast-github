import { useState } from "react";
import { toPng } from "html-to-image";

const Main = () => {
  const [inputUserName, setInputUserName] = useState<string>("");
  const [roastMessage, setRoastMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [avtarUrl, setAvtarUrl] = useState<string>("");

  console.log("Hello, World!", avtarUrl);

  console.log("Hello, World!", loading);

  async function getRoastMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inputUserName === "") {
      setErrorMessage("Please enter a username.");
      setRoastMessage("");
      return;
    }
    const trimmedInput = inputUserName.trim();
    //https://roast-github.up.railway.app
    const URL =
      // "https://roast-github.up.railway.app/api/v1/roast/" + trimmedInput;
      "http://localhost:3000/api/v1/roast/" + trimmedInput;

    setErrorMessage("");
    setRoastMessage("");
    setLoading(true);
    setAvtarUrl("");
    try {
      const eventSource = new EventSource(URL);
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "image") {
          setAvtarUrl(data.url);
        } else if (data.type === "roast") {
          setRoastMessage((prevMessages) => prevMessages + data.content);
        } else if (data.type === "error") {
          setErrorMessage(data.content);
        } else if (data.type === "end") {
          eventSource.close();
          setLoading(false);
        }
      };
      eventSource.onerror = (err) => {
        if (err.eventPhase === EventSource.CLOSED) {
          fetch(URL)
            .then(async (response) => {
              // Check if the response status is not OK (i.e., status code is not in the range 200-299)
              if (!response.ok) {
                // If the response is not OK, read the response body as text
                const text = await response.text();
                // Throw an error with the response text
                throw new Error(text);
              }
              // If the response is OK, read the response body as text and return it
              return response.text();
            })
            .then((message) => {
              // Handle the successful response text
              console.log("Successful response:", message);
              // Optionally update your state with the successful message
              setErrorMessage(message);
            })
            .catch((error) => {
              // Handle any errors that were thrown
              console.error("Error fetching fallback response:", error);
              setErrorMessage(error.message); // Set the error message in the state
            })
            .finally(() => setLoading(false));
        }
        eventSource.close();
        setLoading(false);
        console.error("EventSource failed:", err);
      };
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred. Please try again later.");
      setRoastMessage("");
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    setInputUserName(e.target.value);
  }

  async function downloadImage() {
    setDownloading(true);
    try {
      const dataUrl = await toPng(document.body, { quality: 1 });

      // Create a link element and trigger a download
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `roast-${inputUserName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloading(false);
    } catch (error) {
      console.log(error);
      setDownloading(false);
    }
  }

  const notRoasted: boolean =
    roastMessage.length === 0 ||
    roastMessage === "Github Profile not found." ||
    errorMessage.length > 0;

  function embtyStates() {
    setInputUserName("");
    setRoastMessage("");
    setErrorMessage("");
    setLoading(false);
    setDownloading(false);
    setAvtarUrl("");
  }

  return (
    <div className="flex flex-col items-center w-full gap-6">
      {notRoasted && (
        <>
          <div className="w-full max-w-lg rounded-lg border border-slate-200/5 bg-slate-900/20 shadow-lg px-8 py-6">
            <form
              action=""
              className="flex w-full flex-col gap-4"
              onSubmit={getRoastMessage}
            >
              <input
                type="text"
                placeholder="Enter Your GitHub username"
                className="rounded-md border border-slate-200/5 bg-slate-950 p-3 text-gray-200 placeholder-gray-400 focus:border-sky-600/70 focus:outline-none focus:ring-1 focus:ring-sky-600/70"
                onChange={handleInputChange}
              />
              <button
                className="w-full rounded-md px-4 py-2 border border-slate-200/10 bg-sky-950/35 text-slate-50/90 transition hover:border-sky-800/70 hover:bg-sky-950/90 hover:text-white"
                type="submit"
                disabled={loading}
              >
                {loading ? "Roasting..." : "Roast It"}
              </button>
            </form>
          </div>
          <div className="w-full">
            {roastMessage && (
              <p className="text-center text-red-500/70">{roastMessage}</p>
            )}
            {errorMessage && (
              <p className="text-center text-red-500/70">{errorMessage}</p>
            )}
          </div>
        </>
      )}

      {errorMessage === "" && !notRoasted && (
        <>
          <div className="flex flex-col gap-4 w-full max-w-2xl rounded-lg border border-slate-200/5 bg-slate-900/20 shadow-lg px-8 py-6">
            <div className="flex gap-2 items-start">
              <img
                src={avtarUrl}
                alt="profile-avatar"
                className={`${
                  avtarUrl === "" ? "w-0 h-0" : "w-14 h-14 rounded-full "
                }`}
              />
              <div>
                <h1 className="font-bold text-slate-50/90 text-sm sm:text-base">
                  My GitHub Name
                </h1>
                <h3 className="font-medium text-slate-50/60 text-xs sm:text-sm">
                  @ {inputUserName}
                </h3>
              </div>
            </div>
            <div>
              <p className="leading-relaxed mx-2 text-slate-50/90">
                {roastMessage}
              </p>
            </div>
            <div className="self-end">
              <button
                className={`mt-2 rounded-md p-2 text-sm border mx-auto ${
                  downloading
                    ? "text-gray-400 border-gray-400"
                    : "border-green-400 text-green-400"
                }`}
                onClick={downloadImage}
                disabled={downloading}
              >
                {downloading ? "Downloading" : "Download Image"}
              </button>
            </div>
          </div>
          <div className="w-full max-w-2xl">
            <button
              onClick={embtyStates}
              className="self-start text-sm font-semibold text-neutral-400 transition-colors hover:text-neutral-300 sm:text-base"
            >
              &lt; Re-Roast
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Main;
