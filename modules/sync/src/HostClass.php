<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

enum HostClass: string
{
    case Nonpublic = 'nonpublic';
    case Public = 'public';
}
