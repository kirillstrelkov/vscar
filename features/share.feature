Feature: Sharing
  In order to share web views
  As a user
  I should be able to paste copied url

  Scenario: Share search
    Given I am on "/q=vw%20golf"
    Then I should see "VW Golf 1.4 eHybrid"

  Scenario: Share search
    Given I am on "/compare/ids=1,2"
    Then I should see "VW Golf 1.0 TSI"
    And I should see "VW Golf 1.5 TSI ACT Life"

