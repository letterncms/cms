<?php

declare(strict_types=1);

namespace Cms\Modules\Audit;

/**
 * What the Audit Log calls each change the core makes, once it has happened: "Published Entry", not the
 * ability's own label "Publish Entry", which is a button. Written out, never derived: "Run Import" has no
 * regular past, and "Set" would read the same before and after. A plugin adds its own through the
 * `audit.past` filter; AuditPastTest fails when a core ability that changes something has none.
 */
final class Past
{
    /** Abilities by the names they had: the log keeps what was recorded then, and reads it as the ability now. */
    public const array RENAMED = ['pages/customise' => 'pages/customize'];

    /** @return list<string> An ability's name now and every name it had. */
    public static function names(string $ability): array
    {
        return [$ability, ...array_keys(self::RENAMED, $ability, true)];
    }

    /** @return array<string, string> ability => label, in the reader's language */
    public static function labels(): array
    {
        return [
            'account/two-factor-confirm' => __('Turned On Two-Factor'),
            'account/two-factor-disable' => __('Turned Off Two-Factor'),
            'account/two-factor-setup' => __('Started Two-Factor Setup'),
            'account/update' => __('Updated Own Account'),
            'collaboration/take-over' => __('Took Over Entry'),
            'collections/delete' => __('Deleted Collection'),
            'collections/save' => __('Saved Collection'),
            'comments/create' => __('Commented'),
            'comments/delete' => __('Deleted Comment'),
            'comments/resolve' => __('Resolved Thread'),
            'comments/update' => __('Edited Comment'),
            'components/save' => __('Saved Component'),
            'dashboard-start/update' => __('Hid the Guided Start'),
            'design-code/delete' => __('Deleted Design Script or Style'),
            'design-code/save' => __('Saved Design Script or Style'),
            'design-code/set-custom' => __('Updated Custom CSS and JavaScript'),
            'design-code/set-load' => __('Changed Where Design Scripts and Styles Load'),
            'design-vendor/create' => __('Added Library'),
            'design-vendor/delete' => __('Removed Library'),
            'design-vendor/update' => __('Updated Library'),
            'design/fonts-import' => __('Added Google Font'),
            'design/fonts-upload' => __('Uploaded Font'),
            'design/update' => __('Updated Design System'),
            'email/test' => __('Sent Test Email'),
            'entries/create' => __('Created Entry'),
            'entries/delete' => __('Deleted Entry'),
            'entries/discard-draft' => __('Discarded Changes'),
            'entries/duplicate' => __('Duplicated Entry'),
            'entries/move' => __('Moved Entry'),
            'entries/publish' => __('Published Entry'),
            'entries/reorder' => __('Reordered Entries'),
            'entries/unpublish' => __('Unpublished Entry'),
            'entries/update' => __('Updated Entry'),
            'fieldsets/save' => __('Saved Fieldset'),
            'globals/delete' => __('Deleted Global Set'),
            'globals/save' => __('Saved Global Set'),
            'globals/set' => __('Updated Global Set Values'),
            'kits/apply' => __('Applied Site Kit'),
            'kits/switch' => __('Switched Site Kit'),
            'kits/import' => __('Imported Site Kit'),
            'kits/export' => __('Exported Site as a Kit'),
            'languages/create' => __('Added Language'),
            'languages/delete' => __('Removed Language'),
            'languages/set-default' => __('Made Language the Default'),
            'languages/set-prefix' => __('Changed the Default Language’s Prefix'),
            'languages/update' => __('Saved Languages'),
            'license/delete' => __('Removed License Key'),
            'license/install' => __('Added License Key'),
            'license/refresh' => __('Checked License'),
            'mcp-agents/delete' => __('Disconnected Agent'),
            'media-folders/create' => __('Created Media Folder'),
            'media-folders/delete' => __('Deleted Media Folder'),
            'media-folders/rename' => __('Renamed Media Folder'),
            'media/delete' => __('Deleted Media'),
            'media/import' => __('Imported Media'),
            'media/move' => __('Moved Media'),
            'media/replace' => __('Replaced Media File'),
            'media/transform' => __('Rotated or Cropped Image'),
            'media/update' => __('Updated Media'),
            'navigation/add-item' => __('Added to Menu'),
            'navigation/create' => __('Created Menu'),
            'navigation/delete' => __('Deleted Menu'),
            'navigation/remove-item' => __('Removed from Menu'),
            'navigation/update' => __('Saved Menu'),
            'package-stores/create' => __('Added Store'),
            'package-stores/delete' => __('Removed Store'),
            'packages/add-key' => __('Added License Key'),
            'packages/disable' => __('Turned Off'),
            'packages/enable' => __('Turned On'),
            'packages/install' => __('Installed Plugin'),
            'packages/job-step' => __('Continued Install'),
            'packages/migrate' => __('Ran Pending Upgrades'),
            'packages/rollback' => __('Rolled Back Plugin'),
            'packages/switch' => __('Turned On or Off'),
            'packages/uninstall' => __('Uninstalled Plugin'),
            'packages/update-auto' => __('Changed Automatic Security Updates'),
            'packages/update-check' => __('Checked for Updates'),
            'packages/update-postpone' => __('Postponed Security Update'),
            'packages/update-rollback' => __('Rolled Back Update'),
            'packages/update-start' => __('Started Update'),
            'packages/update-step' => __('Continued Update'),
            'packages/update-switch' => __('Switched Release'),
            'packages/update-tick' => __('Ran Automatic Updates'),
            'packages/upload' => __('Uploaded Plugin'),
            'pages/customize' => __('Customized Built-In Page'),
            'revisions/restore' => __('Restored Revision'),
            'saved-views/create' => __('Saved View'),
            'saved-views/delete' => __('Deleted View'),
            'saved-views/update' => __('Updated View'),
            'settings/update' => __('Updated Settings'),
            'schemas/refresh' => __('Wrote Schema Files'),
            'site/build' => __('Published Site'),
            'sessions/delete' => __('Signed Out Elsewhere'),
            'sync/allow' => __('Changed Pulls and Pushes'),
            'sync/cancel' => __('Cancelled Sync'),
            'sync/connect' => __('Connected Site'),
            'sync/disconnect' => __('Disconnected Site'),
            'sync/renew-key' => __('Made New Connection Key'),
            'sync/resume' => __('Resumed Sync'),
            'sync/start' => __('Started Sync'),
            'sync/step' => __('Continued Sync'),
            'sync/undo' => __('Undid Sync'),
            'terms/import' => __('Imported Terms from Tags'),
            'threads/delete' => __('Deleted Chat'),
            'threads/rename' => __('Renamed Chat'),
            'tokens/create' => __('Created API Token'),
            'tokens/delete' => __('Revoked API Token'),
            'translations/create' => __('Translated Entry'),
            'user-fields/save' => __('Saved User Profile Fields'),
            'users/create' => __('Created User'),
            'users/delete' => __('Deleted User'),
            'users/grant' => __('Gave Access'),
            'users/invite' => __('Resent Invitation'),
            'users/revoke' => __('Took Access Away'),
            'users/update' => __('Updated User'),
            'audit/export' => __('Exported Audit Log'),
        ];
    }
}
