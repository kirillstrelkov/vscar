Feature: Comparison
  In order to find differences between cars
  As a user
  I should be able to compare selected modules side by side

  Background:
    Given I am on homepage

  Scenario: Add multiple models for comparison
    When I type "VW Golf" into search field
    And I select "VW Golf Variant 1.0 TSI Life" for comparison
    And I select "VW Golf Variant 1.5 TSI Life" for comparison
    And I click "Compare"
    Then I should see that in row "Grundpreis" values are highlighted
    And I should see that in row "Modell" values are highlighted
    And I should see that in row "Marke" values are not highlighted
