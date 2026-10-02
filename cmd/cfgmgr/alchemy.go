package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
)

type AlchemyColors struct {
	Red   int `json:"r"`
	Green int `json:"g"`
	Blue  int `json:"b"`
}

func (c AlchemyColors) String() string {
	return fmt.Sprintf("(%d, %d, %d)", c.Red, c.Green, c.Blue)
}
func (c AlchemyColors) Sum(other AlchemyColors) AlchemyColors {
	return AlchemyColors{
		Red:   c.Red + other.Red,
		Green: c.Green + other.Green,
		Blue:  c.Blue + other.Blue,
	}
}
func (c AlchemyColors) LessThan(other AlchemyColors) bool {
	return c.Red < other.Red && c.Green < other.Green && c.Blue < other.Blue
}
func (c AlchemyColors) GreaterThan(other AlchemyColors) bool {
	return c.Red > other.Red && c.Green > other.Green && c.Blue > other.Blue
}
func (c AlchemyColors) Equal(other AlchemyColors) bool {
	return c.Red == other.Red && c.Green == other.Green && c.Blue == other.Blue
}

type Ingredient struct {
	Name      string        `json:"name"`
	Colors    AlchemyColors `json:"colors"`
	Locations []string      `json:"locations"`
}

func (i Ingredient) String() string {
	return i.Name
}

type Ingredients struct {
	Ingredients []Ingredient `json:"ingredients"`
}

type Recipe struct {
	Name   string        `json:"name"`
	Colors AlchemyColors `json:"ingredients"`
}

type Recipes struct {
	Recipes []Recipe `json:"recipes"`
}

func (r *Recipes) GetColors(name string) AlchemyColors {
	for _, r2 := range r.Recipes {
		if r2.Name == name {
			return r2.Colors
		}
	}
	return AlchemyColors{}
}
func LoadIngredients(path string) Ingredients {
	b, err := os.ReadFile(path)
	if err != nil {
		return Ingredients{}
	}
	ingredients := Ingredients{}
	err = json.Unmarshal(b, &ingredients)
	if err != nil {
		fmt.Printf("Failed to parse recipes from file %s: %s\n", path, err)
		os.Exit(1)
	}
	return ingredients
}

func SaveIngredients(path string, ingredients Ingredients) {
	b, err := json.MarshalIndent(ingredients, "", "  ")
	if err != nil {
		fmt.Printf("Failed to marshal ingredients to file %s: %s\n", path, err)
		os.Exit(1)
	}
	err = os.WriteFile(path, b, 0644)
	if err != nil {
		fmt.Printf("Failed to write ingredients to file %s: %s\n", path, err)
		os.Exit(1)
	}
}

func SavePairs(path string, pairs []Solution, triples []Solution) {
	solutions := map[string][]Solution{
		"pairs":   pairs,
		"triples": triples,
	}
	b, err := json.MarshalIndent(solutions, "", "  ")
	if err != nil {
		fmt.Printf("Failed to marshal pairs to file %s: %s\n", path, err)
		os.Exit(1)
	}
	err = os.WriteFile(path, b, 0644)
	if err != nil {
		fmt.Printf("Failed to write pairs to file %s: %s\n", path, err)
		os.Exit(1)
	}
}

func LoadPairs(path string) (pairs []Solution, triples []Solution) {
	b, err := os.ReadFile(path)
	if err != nil {
		return []Solution{}, []Solution{}
	}
	solutions := map[string][]Solution{}
	err = json.Unmarshal(b, &solutions)
	if err != nil {
		fmt.Printf("Failed to parse pairs from file %s: %s\n", path, err)
		os.Exit(1)
	}
	return solutions["pairs"], solutions["triples"]
}

func MustParseInt(s string) int {
	i, err := strconv.Atoi(s)
	if err != nil {
		panic(err)
	}
	return i
}

func (ingredients *Ingredients) Add(name string, colors string, locations string) {
	colorTokens := strings.Split(colors, ",")
	locationTokens := strings.Split(locations, ",")
	ing := Ingredient{
		Name: name,
		Colors: AlchemyColors{
			Red:   MustParseInt(colorTokens[0]),
			Green: MustParseInt(colorTokens[1]),
			Blue:  MustParseInt(colorTokens[2]),
		},
		Locations: locationTokens,
	}
	ingredients.Ingredients = append(ingredients.Ingredients, ing)
}

func (ingredients *Ingredients) Remove(name string) {
	i := -1
	for k, v := range ingredients.Ingredients {
		if v.Name == name {
			i = k
			break
		}
	}
	if i >= 0 {
		ingredients.Ingredients = append(ingredients.Ingredients[:i], ingredients.Ingredients[i+1:]...)
	}
}

func (i Ingredient) HasLocation(locations []string) bool {
	for _, l := range i.Locations {
		for _, l2 := range locations {
			if l2 == l {
				return true
			}
		}
	}
	return false
}

type Solution struct {
	Ingredients []Ingredient
}

func (s Solution) String() string {
	return fmt.Sprintf("%+v", s.Ingredients)
}

func (s Solution) SumColors() AlchemyColors {
	sum := AlchemyColors{}
	for _, ing := range s.Ingredients {
		sum = sum.Sum(ing.Colors)
	}
	return sum
}

func (ingredients *Ingredients) BuildAllPairs() []Solution {
	solutions := []Solution{}
	n := len(ingredients.Ingredients)
	for i := 0; i < n; i++ {
		for j := i; j < n; j++ {
			solutions = append(solutions, Solution{
				Ingredients: []Ingredient{ingredients.Ingredients[i], ingredients.Ingredients[j]},
			})
		}
	}
	return solutions
}

func (ingredients *Ingredients) BuildAllTriples() []Solution {
	triples := []Solution{}
	n := len(ingredients.Ingredients)
	for i := 0; i < n; i++ {
		for j := i; j < n; j++ {
			for k := j; k < n; k++ {
				triples = append(triples, Solution{
					Ingredients: []Ingredient{
						ingredients.Ingredients[i],
						ingredients.Ingredients[j],
						ingredients.Ingredients[k],
					},
				})
			}
		}
	}
	return triples
}

// Solve returns sets of ingredients that, when combined, will produce the given color quantities.
func (ingredients *Ingredients) Solve(recipeColors AlchemyColors, excludeLocations []string, maxIngredients int) ([]Solution, error) {
	solutions := []Solution{}

	// Search all pairs of ingredients for ones that add up to the desired color set.
	pairs := ingredients.BuildAllPairs()
	for i, pair := range pairs {
		if pair.SumColors().Equal(recipeColors) {
			// Check if the pair is allowed to be used in the recipe.
			for _, ing := range pair.Ingredients {
				if ing.HasLocation(excludeLocations) {
					continue
				}
			}
			solutions = append(solutions, pairs[i])
		}
	}

	// Break here if the user only wants 2-ingredient recipes - these are useful if you haven't unlocked the Laboratory II yet.
	if maxIngredients < 3 {
		return solutions, nil
	}

	// Build a set of all 3-ingredient triples and scan for ones that add up to the desired color set.
	triples := ingredients.BuildAllTriples()
	for i, triple := range triples {
		if triple.SumColors().Equal(recipeColors) {
			solutions = append(solutions, triples[i])
		}
	}
	return solutions, nil
}

func LoadRecipes(path string) Recipes {
	b, err := os.ReadFile(path)
	if err != nil {
		return Recipes{}
	}
	recipes := Recipes{}
	err = json.Unmarshal(b, &recipes)
	if err != nil {
		fmt.Printf("Failed to parse recipes from file %s: %s\n", path, err)
		os.Exit(1)
	}
	return recipes
}

func SaveRecipes(path string, recipes Recipes) {
	b, err := json.MarshalIndent(recipes, "", "  ")
	if err != nil {
		fmt.Printf("Failed to marshal recipes to file %s: %s\n", path, err)
		os.Exit(1)
	}
	err = os.WriteFile(path, b, 0644)
	if err != nil {
		fmt.Printf("Failed to write recipes to file %s: %s\n", path, err)
		os.Exit(1)
	}
}

func (r *Recipes) Add(name string, colors string) {
	colorTokens := strings.Split(colors, ",")
	newRecipe := Recipe{
		Name: name,
		Colors: AlchemyColors{
			Red:   MustParseInt(colorTokens[0]),
			Green: MustParseInt(colorTokens[1]),
			Blue:  MustParseInt(colorTokens[2]),
		},
	}
	r.Recipes = append(r.Recipes, newRecipe)
}

func (r *Recipes) Remove(name string) {
	i := -1
	for k, v := range r.Recipes {
		if v.Name == name {
			i = k
			break
		}
	}
	if i >= 0 {
		r.Recipes = append(r.Recipes[:i], r.Recipes[i+1:]...)
	}
}
