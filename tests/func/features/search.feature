Feature: Search
  In order to find best car
  As a user
  I should be able to find car models with simple text
  and filter them using different attributes

  Background:
    Given I am on homepage

  Scenario: Search by car model
    When I type "VW Golf" into search field
    Then I should see "VW Golf Variant 1.0 TSI Life (ab 11/20)" in table

  Scenario: Search by car model and motor type
    When I type "VW Golf" into search field
    And I select "Diesel" as "Motorart"
    Then I should see "VW Golf 2.0 TDI " in table
    And I should not see "TSI" in table

  Scenario: Search by car model, motor type, transmission
    When I select "Otto" as "Motorart"
    And I select "Automatikgetriebe" as "Getriebeart"
    Then I should see "Automatikgetriebe" in table
    And I should see "Super" in table
    And I should not see "Strom" in table
    And I should not see "Schaltgetriebe" in table

  Scenario: Search using multiple values
    When I type "xceed" into search field
    And I select "Diesel (Mild-Hybrid),PlugIn-Hybrid" as "Motorart"
    Then I should see "KIA XCeed 1.6 CRDi " in table
    And I should see "KIA XCeed 1.6 GDI Plug-in-Hybrid" in table

  Scenario: Search by price
    When I select "10000" as maximum value in "Grundpreis"
    And I select "10" items per page
    Then I should see "Opel Rocks" in table
    And I should not see "Dacia" in table

  Scenario: Search by top speed
    When I select "251" as minimum value in "Höchstgeschwindigkeit"
    Then I should see "VW Golf R Performance" in table
    And I should not see "Hyundai i30 N" in table

  Scenario: Search order
    When I type "VW Golf" into search field
    Then "VW Golf Variant 1.0" should be before "VW Golf Variant 1.5"
    And "30375" should be before "32245"
