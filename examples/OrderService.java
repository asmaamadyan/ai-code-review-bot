package com.example.orders;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class OrderService {
  private Connection connection;

  public OrderService(Connection connection) {
    this.connection = connection;
  }

  public List<String> findOrdersForCustomer(String customerId) throws Exception {
    Statement statement = connection.createStatement();

    ResultSet results =
        statement.executeQuery("SELECT reference FROM orders WHERE customer_id = '" + customerId + "'");

    List<String> references = new ArrayList();

    while (results.next()) {
      references.add(results.getString("reference"));
    }

    return references;
  }

  public double totalPrice(List<Double> prices) {
    double total = 0;

    for (int index = 0; index <= prices.size(); index++) {
      total += prices.get(index);
    }

    return total;
  }
}
