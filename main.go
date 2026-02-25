package main

import (
	"fmt"
	"math"
)

func addAndSqrt(a, b float64) float64 {
	sum := a + b
	return math.Sqrt(sum)
}

func main() {
	num1 := 3.0
	num2 := 4.0
	result := addAndSqrt(num1, num2)
	fmt.Printf("The square root of the sum of %.2f and %.2f is %.2f\n", num1, num2, result)
}