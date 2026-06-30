/**
 * Settings Page Template
 *
 * Copy this file into src/pages/ and customize it for your plugin's settings
 * screen. Replace placeholder text, add your settings controls inside the
 * <section> slot, and wire up the onBack callback to navigate back to the
 * main page.
 *
 * Layout: PageHeader (secondary)  ->  SectionHeader  ->  content  ->  PageFooter
 */
import * as React from 'react';
import { Button, PageHeader, SectionHeader, PageFooter } from '../components';

function SettingsPage({ onBack }: { onBack: () => void }) {
  return (
    <main>
      <header>
        <PageHeader
          navigation="secondary"
          title="Settings"
          description="Description of what settings can be set."
          action={
            <Button
              label="Back"
              variant="neutral"
              emphasis="tertiary"
              icon="arrow-left"
              iconPosition="only"
              onClick={onBack}
            />
          }
          actionPosition="start"
        />
        <SectionHeader
          title="Section title"
          body="Additional information - optional"
        />
      </header>

      <section>
        {/* Settings UI here */}
      </section>

      <PageFooter
        builderName="name"
        builderSlack="https://affirm.slack.com/team/..."
        updatedDate="MM.DD.YYYY"
        className="affirm-page-footer"
      />
    </main>
  );
}

export default SettingsPage;
