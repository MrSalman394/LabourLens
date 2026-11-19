-- CreateIndex
CREATE INDEX "addresses_location_idx" ON "addresses" USING GIST ("location");
