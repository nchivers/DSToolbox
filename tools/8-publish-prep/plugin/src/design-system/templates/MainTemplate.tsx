/**
 * Main Page Template
 *
 * Copy this file into src/ui.tsx (or src/pages/) and customize it for your
 * plugin. Replace placeholder text, wire up your own state and message
 * handlers, and add your UI inside the <section> slot.
 *
 * Layout: PageHeader  ->  SectionHeader  ->  content  ->  PageFooter
 */
import * as React from 'react';
import { Button, PageHeader, SectionHeader, PageFooter } from '../components';

function MainPage() {
  return (
    <main>
      <header>
        <PageHeader
          title="Plugin Title"
          description="Description of what the plugin does at a high level."
          action={
            <Button
              label="Settings"
              variant="neutral"
              emphasis="tertiary"
              icon="levels"
              iconPosition="only"
            />
          }
        />
        <SectionHeader
          title="Instructions"
          body="General instructions for how to use the plugin."
        />
      </header>

      <section>
        {/* Your plugin UI here */}
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

export default MainPage;
