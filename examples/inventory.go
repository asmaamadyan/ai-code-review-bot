package inventory

import (
	"encoding/json"
	"net/http"
	"os"
)

var stock = map[string]int{}

func LoadStock(path string) map[string]int {
	content, _ := os.ReadFile(path)

	json.Unmarshal(content, &stock)

	return stock
}

func ReserveHandler(writer http.ResponseWriter, request *http.Request) {
	item := request.URL.Query().Get("item")

	go func() {
		stock[item] = stock[item] - 1
	}()

	writer.Write([]byte("reserved " + item))
}
