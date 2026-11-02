<?php

declare(strict_types=1);

namespace Cms\Users;

use Illuminate\Http\Request;

/**
 * The `account` in a page every visitor gets the same copy of: a built page, or one a cache may
 * share. Only the browser knows whether someone is signed in, from a cookie that says only that.
 * A block shown or hidden on `account` is then left for the browser to show or hide.
 */
final class AccountInBrowser
{
    public const string COOKIE = 'cms_signed_in';

    /** The cookie's name on this request: sites on their own localhost port have their own, as for the session. */
    public static function cookie(Request $request): string
    {
        $port = (int) $request->getPort();

        return self::COOKIE.(in_array($port, [0, 80, 443], true) ? '' : '-'.$port);
    }

    /** Marks the page signed in or out before it's painted. The browser works out the same name from its own port. */
    public static function script(): string
    {
        return '<script>(function(){var p=location.port,n="'.self::COOKIE.'"+(p&&p!=="80"&&p!=="443"?"-"+p:"")+"=";if((";"+document.cookie).replace(/; ?/g,";").indexOf(";"+n)>-1)document.documentElement.setAttribute("data-cms-signed-in","")})()</script>'
            .'<style>html:not([data-cms-signed-in]) [data-cms-account="in"],html[data-cms-signed-in] [data-cms-account="out"]{display:none!important}</style>';
    }
}
