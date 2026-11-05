<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use RuntimeException;

/** The other site said no, and why: trying again won't change it. */
final class RemoteRefused extends RuntimeException {}
