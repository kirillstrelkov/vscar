Feature: Search
  In order to find best car
  As a user
  I should be able to find car models with simple text
  and filter them using different attributes

  Background:
    Given I am on homepage

  Scenario: Search by car model
    When I type "VW Golf" into search field
    Then I should see "VW Golf 1.4 eHybrid"

  Scenario: Search by car model and fuel type
    When I type "VW Golf" into search field
    And I select "Diesel" as "Fuel type"
    Then I should see "VW Golf 2.0 TDI "
    And I should not see "TSI"

  Scenario: Search using multiple values
    When I type "Fuel" into search field
    And I select "Fuel type"
    And I select "PlugIn-Hybrid,Diesel"
    Then I should see "VW Golf 2.0 TDI "
    And I should see "VW Golf 1.4 eHybrid"

  Scenario: Search by price
    When I type "Price" into search field
    And I select "8000" as maximum value
    Then I should see "Dacia"

  Scenario: Search using number comparison
    When I type "Top speed" into search field
    And I select "222" as minimal value
    Then I should see "VW Golf 2.0 TDI SCR R-Line DSG"
    And I should not see "VW Golf 1.0 TSI"

  Scenario: Search order
    When I type "VW Golf" into search field
    Then "19881" should be before "26037"
    And "VW Golf 1.0 TSI" should be before "VW Golf 1.5 TSI"

