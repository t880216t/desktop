<template>
  <div
    class="live-dock"
    :class="{ collapsed, 'can-animate': canAnimate, 'live-dock--left': onLeft }"
    :style="{ width: liveDockSize + 'px' }"
  >
    <div class="live-dock-chevron" @click="collapsed ? setCollapsed(false) : setCollapsed(true)">
      <i
        :class="{
          'icon-back': (!onLeft && collapsed) || (onLeft && !collapsed),
          'icon-down icon-right': (onLeft && collapsed) || (!onLeft && !collapsed),
        }"
      />
    </div>

    <transition name="slide-fade">
      <div v-if="!collapsed" class="live-dock-expanded-contents">
        <div class="live-dock-header">
          <div class="flex flex--center">
            <div :class="{ 'live-dock-pulse': true, 'live-dock-offline': !isStreaming }" />
            <span class="live-dock-text">
              {{ liveText }}
            </span>
            <span class="live-dock-timer">
              {{ elapsedStreamTime }}
            </span>
          </div>
          <div class="live-dock-viewer-count">
            <i
              :class="{
                'icon-view': !hideViewerCount,
                'icon-hide': hideViewerCount,
              }"
              @click="toggleViewerCount"
            />
            <span class="live-dock-viewer-count__count">{{ viewerCount }}</span
            ><span v-if="viewerCount >= 0">{{ $t('viewers') }}</span>
          </div>
        </div>

        <div class="live-dock-info">
          <div class="live-dock-platform-tools">
            <a
              @click="showEditStreamInfo"
              v-if="canEditChannelInfo"
              v-tooltip.right="editStreamInfoTooltip"
            >
              <i class="icon-edit" />
            </a>
            <a
              @click="openYoutubeStreamUrl"
              v-if="isYoutube && isStreaming"
              v-tooltip="viewStreamTooltip"
            >
              <i class="icon-studio" />
            </a>
            <a
              @click="openYoutubeControlRoom"
              v-if="isYoutube && isStreaming"
              v-tooltip.top="controlRoomTooltip"
            >
              <i class="icon-settings" />
            </a>
            <a
              @click="openFBStreamUrl"
              v-if="isFacebook && isStreaming"
              v-tooltip="viewStreamTooltip"
            >
              <i class="icon-studio" />
            </a>
            <a
              @click="openFBStreamDashboardUrl"
              v-if="isFacebook && isStreaming"
              v-tooltip="liveProducerTooltip"
            >
              <i class="icon-settings" />
            </a>
            <a
              @click="openTrovoStreamUrl"
              v-if="isTrovo"
              v-tooltip.right="viewStreamTooltip"
            >
              <i class="icon-studio" />
            </a>
          </div>
          <div class="flex">
            <a @click="refreshChat" v-if="isTwitch || isTrovo || (isYoutube && isStreaming) || isFacebook">
              {{ $t('Refresh Chat') }}
            </a>
          </div>
        </div>
        <div
          class="live-dock-chat"
          v-if="!hideStyleBlockers && (isTwitch || isTrovo || (isYoutube && isStreaming) || (isFacebook && isStreaming))"
        >
          <div v-if="hasChatTabs" class="flex">
            <tabs :tabs="chatTabs" v-model="selectedChat" :hideContent="true" />
            <i
              class="live-dock-chat-apps__popout icon-pop-out-1"
              v-tooltip.left="$t('Pop out to new window')"
              v-if="isPopOutAllowed"
              @click="popOut"
            />
          </div>
          <!-- v-if is required because left-side chat will not properly load on application startup -->
          <chat
            v-if="!applicationLoading && !collapsed"
            :componentProps="{ restream: selectedChat === 'restream' }"
          />
          <PlatformAppPageView
            v-if="selectedChat !== 'default' && selectedChat !== 'restream'"
            class="live-dock-platform-app-webview"
            :appId="selectedChat"
            :pageSlot="slot"
            :key="selectedChat"
          />
        </div>
        <div class="flex flex--center flex--column live-dock-chat--offline" v-else>
          <img class="live-dock-chat__img--offline" :src="offlineImageSrc" />
          <span v-if="!hideStyleBlockers">{{ $t('Your chat is currently offline') }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" src="./LiveDock.vue.ts"></script>

<style lang="less" scoped>
@import '../styles/index';

.live-dock {
  padding-left: 16px;
  position: relative;
  z-index: 1000;
  width: 28%;
  box-sizing: border-box;
  border-left: 1px solid var(--border);

  &.can-animate {
    transition: width 300ms;
  }

  &.live-dock--left {
    padding-left: 0;
    padding-right: 16px;
    border-right: 1px solid var(--border);
  }

  @media (max-width: 1070px) {
    display: none;
  }
}

.live-dock--left {
  .live-dock-chevron {
    right: 0;
    left: auto;
  }

  .live-dock-expanded-contents {
    border-right: 1px solid var(--border);
    border-left: none;
  }
}

.live-dock.collapsed {
  width: 20px !important;
  padding: 0;

  .live-dock-chevron {
    .center();

    border: none;
  }
}

.live-dock-chevron {
  width: 16px;
  height: 20px;
  position: absolute;
  top: 0;
  left: 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;

  i {
    .center();

    font-size: 12px;

    &.icon-right {
      transform: translate(-50%, -50%) rotate(-90deg);
    }
  }
}

.live-dock-end-stream {
  margin-left: 10px;
}

.live-dock-header {
  .margin-bottom();

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.live-dock-text {
  .weight(@medium);

  margin: 0 2px 0 4px;
}

.live-dock-expanded-contents {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  border-left: 1px solid var(--border);
}

.live-dock-info {
  .margin-bottom();

  display: flex;
  justify-content: space-between;

  .live-dock-platform-tools {
    a {
      padding: 0 8px;
    }
  }
}

.live-dock-viewer-count {
  .flex();
  .flex--center();

  i {
    .margin-right();
  }

  .live-dock-viewer-count-toggle {
    opacity: 0;
    cursor: pointer;
  }

  &:hover {
    .live-dock-viewer-count-toggle {
      opacity: 1;
    }
  }
}

.live-dock-viewer-count__count {
  padding-right: 3px;
}

.live-dock-chat {
  .flex();
  .flex--column();
  .flex--grow();
}

.live-dock-chat--offline {
  height: 100%;
}

.live-dock-chat__img--offline {
  .flex();
  .flex--center();
  .flex--column();

  width: 60%;
  margin-bottom: 16px;
}

.live-dock-pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--warning);
  margin: 0 8px;
  box-shadow: 0 0 0 rgba(252, 62, 63, 0.4);

  &.live-dock-offline {
    background: var(--icon);
    animation: none;
  }
}

.live-dock-platform-tools {
  .flex();
}

.live-dock-chat-apps__popout {
  .padding();
  .cursor--pointer();
}

.live-dock-platform-app-webview {
  .flex--grow();
}
</style>
