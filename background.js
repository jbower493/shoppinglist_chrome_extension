function pullDataFromSchema(schema) {
    function getInstructions(instructions) {
        return instructions
            .map((step, index) => {
                return `${index + 1}. ${step.text}`;
            })
            .join("\n");
    }

    function getItems(ingredients) {
        return ingredients.map((ingredient) => {
            const split = ingredient.split(" ").filter((segment) => segment);

            let quantity = null;
            let quantityUnit = null;
            let name = null;

            // Parse the string and try to extract the above properties

            // If first segment is a number, grab it and remove it from the split
            if (!isNaN(Number(split[0]))) {
                quantity = Number(split.splice(0, 1));
            }

            // If new first segment is a fraction, grab it and remove it from the split
            const maybeFraction = split[0].split("/");

            if (
                maybeFraction.length === 2 &&
                !isNaN(Number(maybeFraction[0])) &&
                !isNaN(Number(maybeFraction[1]))
            ) {
                const decimal =
                    Number(maybeFraction[0]) / Number(maybeFraction[1]);

                // If there was a whole number before the fraction, add it to the decimal, otherwise it's just the decimal
                quantity =
                    typeof quantity === "number" ? quantity + decimal : decimal;
                split.splice(0, 1);
            }

            // If new first segment is a valid quantity unit, grab it and remove it from the split
            const quantityUnitList = [
                { name: "grams", symbol: "g" },
                { name: "pounds", symbol: "lbs" },
                { name: "ounces", symbol: "oz" },
                { name: "cups", symbol: "cups" },
                { name: "millilitres", symbol: "mL" },
                { name: "litres", symbol: "L" },
                { name: "fluid ounces", symbol: "fl.oz" },
                { name: "teaspoon", symbol: "tsp" },
                { name: "tablespoon", symbol: "tbsp" },
            ];

            const matchingUnit = quantityUnitList.find(({ name, symbol }) => {
                const singular = name.endsWith("s")
                    ? name.slice(0, name.length - 1)
                    : name;
                const plural = name.endsWith("s") ? name : `${name}s`;

                return (
                    [singular, plural].includes(split[0]) || split[0] === symbol
                );
            });

            if (matchingUnit) {
                quantityUnit = matchingUnit.name;
                split.splice(0, 1);
            }

            // Remaining segments make up the name
            name = split.join(" ");

            // Default quantity to 1
            if (typeof quantity !== "number") {
                quantity = 1;
            }

            return {
                name,
                quantity,
                quantity_unit: quantityUnit,
            };
        });
    }

    return {
        name: schema.name,
        recipe_category: null,
        instructions: getInstructions(schema.recipeInstructions),
        prep_time: 25,
        serves: 2,
        items: getItems(schema.recipeIngredient),
    };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (
        message.type === "FROM_POPUP_TO_BACKGROUND" &&
        message.action === "SEND_DATA_TO_SERVER"
    ) {
        (async () => {
            try {
                const dataFromWebpage = message.data;

                console.log(dataFromWebpage);

                const newRecipe = {
                    email: "bob@bob.com",
                    recipe: pullDataFromSchema(dataFromWebpage),
                };

                const res = await fetch(
                    "http://localhost:8000/api/recipe/import-from-chrome-extension",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(newRecipe),
                    }
                );
                const data = await res.json();

                sendResponse({
                    success: true,
                    message: "Message received and processed!",
                    data: data,
                });
            } catch (e) {
                console.error(e);

                sendResponse({
                    success: false,
                    message: "Something went wrong",
                });
            }
        })();

        return true;
    }
});
