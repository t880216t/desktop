import { test, TExecutionContext, useSpectron } from '../../helpers/spectron';
import { ISceneCollectionsServiceApi } from '../../../app/services/scene-collections';
import { getApiClient } from '../../helpers/api-client';
import { click, closeWindow, focusChild, focusMain } from '../../helpers/modules/core';
import { useForm } from '../../helpers/modules/forms';

useSpectron();

async function clickAdvancedAudio(t: TExecutionContext) {
  const $mixer = await t.context.app.client.$('h2=Mixer');
  const $settings = await (await $mixer.$('..')).$('.icon-settings');
  await $settings.click();
}

// TODO: Fix form recognition of PanelHeader form
// const DEFAULT_AUDIO_SETTINGS = {
//   deflection: 100,
//   streamTrack: true,
//   flag0: true,
//   flag1: true,
//   flag2: true,
//   flag3: true,
//   flag4: true,
//   flag5: true,
// };

const DEFAULT_DETAIL_SETTINGS = {
  forceMono: false,
  syncOffset: 0,
  // TODO: Fix input recognition of lists
  // monitoringType: '0',
};

test('Change Advanced Audio Settings', async t => {
  await clickAdvancedAudio(t);
  await focusChild();
  await click('.icon-add');

  // check default settings
  const headerForm = useForm('advanced-audio-header');
  const detailForm = useForm('advanced-audio-detail');
  // await headerForm.assertFormContains(DEFAULT_AUDIO_SETTINGS);
  await detailForm.assertFormContains(DEFAULT_DETAIL_SETTINGS);

  // update settings
  // const updatedAudioSettings = {
  //   deflection: 50,
  //   streamTrack: false,
  //   flag0: false,
  //   flag1: false,
  //   flag2: false,
  //   flag3: false,
  //   flag4: false,
  //   flag5: false,
  // };
  // await headerForm.fillForm(updatedAudioSettings);
  // await headerForm.assertFormContains(updatedAudioSettings);

  const updatedDetailSettings = {
    forceMono: true,
    syncOffset: 1000,
    // monitoringType: '1',
  };
  await detailForm.fillForm(updatedDetailSettings);
  await detailForm.assertFormContains(updatedDetailSettings);

  // check settings are still updated after window close
  await closeWindow('child');
  await focusMain();
  await clickAdvancedAudio(t);
  await focusChild();
  await click('.icon-add');

  // await headerForm.assertFormContains(updatedAudioSettings);
  await detailForm.assertFormContains(updatedDetailSettings);

  // reload config
  const apiClient = await getApiClient();
  const sceneCollectionsService = apiClient.getResource<ISceneCollectionsServiceApi>(
    'SceneCollectionsService',
  );
  await sceneCollectionsService.load(sceneCollectionsService.collections[0].id);

  // check settings are still updated after config reload
  await focusMain();
  await clickAdvancedAudio(t);
  await focusChild();
  await click('.icon-add');

  // await headerForm.assertFormContains(updatedAudioSettings);
  await detailForm.assertFormContains(updatedDetailSettings);

  t.pass();
});
