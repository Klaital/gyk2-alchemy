package main

import (
	"flag"
	"fmt"
	"os"
)

func printMainUsage() {
	fmt.Println("Usage: cfgmgr [ingredient|recipe] [add|remove|list] [options]")
}
func main() {
	// 1. Ensure at least the primary resource (ingredient/recipe) is provided
	if len(os.Args) < 2 {

		os.Exit(1)
	}

	resource := os.Args[1]
	switch resource {
	case "ingredient":
		handleIngredient(os.Args[2:])
	case "recipe":
		handleRecipe(os.Args[2:])
	case "-h", "--help":
		printMainUsage()
	default:
		fmt.Printf("Unknown resource: %s\n", resource)
		printMainUsage()
		os.Exit(1)
	}
}

func handleIngredient(args []string) {
	if len(args) < 1 {
		fmt.Println("Expected 'add', 'remove', or 'list' subcommand for ingredients.")
		os.Exit(1)
	}

	ingredients := LoadIngredients("ingredients.json")

	subcommand := args[0]
	subArgs := args[1:]

	switch subcommand {
	case "add":
		cmd := flag.NewFlagSet("ingredient add", flag.ExitOnError)
		name := cmd.String("name", "", "Name of the ingredient (Required)")
		colors := cmd.String("colors", "0,0,0", "Quantity (Required)")
		locations := cmd.String("locations", "", "Areas where the ingredient can be gathered, if any")
		cmd.Parse(subArgs)

		ingredients.Add(*name, *colors, *locations)
		SaveIngredients("ingredients.json", ingredients)
		// Rebuild the pair and triple lists.
		pairs := ingredients.BuildAllPairs()
		triples := ingredients.BuildAllTriples()
		SavePairs("pairs.json", pairs, triples)

	case "remove":
		cmd := flag.NewFlagSet("ingredient remove", flag.ExitOnError)
		name := cmd.String("name", "", "Name of the ingredient to remove (Required)")
		cmd.Parse(subArgs)

		if *name == "" {
			fmt.Println("Error: --name is required.")
			cmd.Usage()
			os.Exit(1)
		}

		ingredients.Remove(*name)
		SaveIngredients("ingredients.json", ingredients)
		// Rebuild the pair and triple lists.
		pairs := ingredients.BuildAllPairs()
		triples := ingredients.BuildAllTriples()
		SavePairs("pairs.json", pairs, triples)

	case "list":
		// List takes no parameters, ignore extra arguments
		fmt.Println("Listing all ingredients...")
		for _, ing := range ingredients.Ingredients {
			fmt.Printf("  %s: %s\n", ing.Name, ing.Colors)
		}

	default:
		fmt.Printf("Unknown ingredient action: %s. Use add, remove, or list.\n", subcommand)
		os.Exit(1)
	}
}

// --- RECIPE HANDLER ---

func handleRecipe(args []string) {
	if len(args) < 1 {
		fmt.Println("Expected 'add', 'remove', or 'list' subcommand for recipes.")
		os.Exit(1)
	}

	recipes := LoadRecipes("recipes.json")

	subcommand := args[0]
	subArgs := args[1:]

	switch subcommand {
	case "add":
		cmd := flag.NewFlagSet("recipe add", flag.ExitOnError)
		title := cmd.String("title", "", "Title of the recipe (Required)")
		colors := cmd.String("colors", "0,0,0", "Color configuration (Required)")
		cmd.Parse(subArgs)

		if *title == "" {
			fmt.Println("Error: --title is required.")
			cmd.Usage()
			os.Exit(1)
		}
		recipes.Add(*title, *colors)
		SaveRecipes("recipes.json", recipes)

	case "remove":
		cmd := flag.NewFlagSet("recipe remove", flag.ExitOnError)
		title := cmd.String("title", "", "Title of the recipe to remove (Required)")
		cmd.Parse(subArgs)

		if *title == "" {
			fmt.Println("Error: --title is required.")
			cmd.Usage()
			os.Exit(1)
		}
		recipes.Remove(*title)
		SaveRecipes("recipes.json", recipes)

	case "list":
		// List takes no parameters, ignore extra arguments
		for _, r := range recipes.Recipes {
			fmt.Printf("  %s: %s\n", r.Name, r.Colors)
		}

	case "solve":
		cmd := flag.NewFlagSet("recipe solve", flag.ExitOnError)
		title := cmd.String("title", "", "Title of the recipe to solve (Required)")
		cmd.Parse(subArgs)
		ingredients := LoadIngredients("ingredients.json")
		solutions, err := ingredients.Solve(recipes.GetColors(*title), []string{}, 10)
		if err != nil {
			fmt.Printf("Failed to solve recipe %s: %s\n", *title, err)
			os.Exit(1)
		}
		for _, s := range solutions {
			fmt.Printf("  %s\n", s.String())
		}
	default:
		fmt.Printf("Unknown recipe action: %s. Use add, remove, or list.\n", subcommand)
		os.Exit(1)
	}
}
