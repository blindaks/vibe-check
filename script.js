const getOutfitSuggestion = async (mood, gender) => {
  const key = "07f2db5d81d18450d2d162fbo30aat29";
  const context = `You are a fashion expert who suggests outfits based on mood. You have to suggest a complete outfit based on the user's input - mood and gender. You should provide direct answers in HTML format, for example: Mini Dress, Strappy heels, Statement earrings, clutch bag, bold lip color. Do not mention "For a happy woman.." etc. Give directly outfits as answer.`;
  const prompt = `User's input: mood is ${mood} and gender is ${gender}. Please suggest an outfit.`;
  const url = `https://api.shecodes.io/ai/v1/generate?prompt=${encodeURIComponent(
    prompt
  )}&context=${encodeURIComponent(context)}&key=${key}`;

  try {
    const response = await axios.get(url);
    console.log("SheCodes API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching outfit suggestion:", error);
    return {};
  }
};

const parseOutfitItems = (data) => {
  if (data && data.answer) {
    const htmlString = data.answer;
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const listItems = doc.querySelectorAll("li");
    return Array.from(listItems).map((li) => li.textContent.trim());
  } else {
    console.error("Unexpected data format:", data);
    return [];
  }
};

const fetchImageFromPexels = async (query) => {
  const apiKey = "MtPcMEBPjJDsS44S31BmgktUlBCzNcRZNThQftBy28y8occpt6zvD8fF";
  try {
    const response = await axios.get("https://api.pexels.com/v1/search", {
      headers: {
        Authorization: apiKey,
      },
      params: {
        query: query,
        per_page: 1,
      },
    });
    return response.data.photos[0]?.src?.medium;
  } catch (error) {
    console.error("Error fetching image from Pexels:", error);
  }
};

const displayOutfitImages = async () => {
  const mood = document.getElementById("mood").value;
  const gender = document.getElementById("gender").value;

  if (!mood || !gender) {
    alert("Please fill out all fields.");
    return;
  }

  const imagesContainer = document.getElementById("imagesContainer");
  imagesContainer.innerHTML = "";

  try {
    const outfitData = await getOutfitSuggestion(mood, gender);
    const outfitItems = parseOutfitItems(outfitData);

    if (outfitItems.length === 0) {
      imagesContainer.innerHTML = "<p>No outfit suggestions found.</p>";
      return;
    }

    for (const item of outfitItems) {
      const imageUrl = await fetchImageFromPexels(item);
      if (imageUrl) {
        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = item;

        const p = document.createElement("p");
        p.textContent = item;

        const imageItem = document.createElement("div");
        imageItem.className = "image-item";
        imageItem.appendChild(img);
        imageItem.appendChild(p);

        imagesContainer.appendChild(imageItem);
      }
    }
  } catch (error) {
    console.error("Error displaying outfit images:", error);
    imagesContainer.innerHTML = "<p>Error displaying outfit images.</p>";
  }
};

document
  .getElementById("getOutfit")
  .addEventListener("click", displayOutfitImages);

document.addEventListener("DOMContentLoaded", () => {
  const modeToggle = document.getElementById("modeToggle");
  const body = document.body;

  // Check local storage for mode preference
  const savedMode = localStorage.getItem("theme");

  if (savedMode === "light") {
    body.classList.add("light-mode");
    modeToggle.textContent = "Dark Mode";
  }

  modeToggle.addEventListener("click", () => {
    body.classList.toggle("light-mode");

    // Update button text based on current mode
    const isLightMode = body.classList.contains("light-mode");
    modeToggle.textContent = isLightMode ? "Dark Mode" : "Light Mode";

    // Save mode preference in local storage
    localStorage.setItem("theme", isLightMode ? "light" : "dark");
  });
});
