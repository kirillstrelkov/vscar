Feature: Comparison
  In order to find differences between cars
  As a user
  I should be able to compare selected modules side by side

  Background:
    Given I am on homepage

  Scenario: Add multiple models to comparison
    When I type "VW Golf" into search field
    And I select "VW Golf 1.0 TSI (ab 03/20)" to comparison
    And I select "VW Golf 1.5 TSI ACT Life" for comparison
    And I click "Compare selected models"
    Then I should see that in row "Price" values are highlighted
    And I should see that in row "Maximum power in kW" values are highlighted
    And I should see that in row "Trunk volume normal" values are not highlighted

